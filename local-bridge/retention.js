/**
 * Pit Wall Data Retention and Compression Strategy
 * Downsamples old, high-frequency samples from 60Hz to 20Hz.
 */
async function executeRetentionPolicy(db) {
  try {
    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);

    console.log("[retention] Executing tiered retention sweeps...");

    // Find sessions older than 7 days
    const oldSessions = await db
      .collection("telemetry_sessions")
      .find({ start_time: { $lt: sevenDaysAgo } })
      .toArray();

    let downsampledCount = 0;

    for (let session of oldSessions) {
      // Downsample telemetry_samples by keeping every 3rd entry
      const samples = await db
        .collection("telemetry_samples")
        .find({ session_id: session._id })
        .sort({ timestamp: 1 })
        .toArray();

      if (samples.length > 50) {
        const toEvict = [];
        samples.forEach((sample, index) => {
          if (index % 3 !== 0) {
            toEvict.push(sample._id);
          }
        });

        if (toEvict.length > 0) {
          await db.collection("telemetry_samples").deleteMany({ _id: { $in: toEvict } });
          downsampledCount += toEvict.length;
        }
      }
    }

    if (downsampledCount > 0) {
      console.log(
        `[retention] Successfully downsampled ${downsampledCount} legacy samples to 20Hz footprint.`,
      );
    } else {
      console.log("[retention] No sessions older than 7 days require compaction.");
    }
  } catch (e) {
    console.warn(`[retention] Retention execution failed: ${e.message}`);
  }
}

module.exports = { executeRetentionPolicy };
