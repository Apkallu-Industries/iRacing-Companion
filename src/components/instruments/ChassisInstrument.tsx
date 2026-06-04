import React, { useEffect, useRef, useState } from "react";
import { useTelemetry } from "@/lib/useTelemetry";
import { TelemetryInstrument } from "./TelemetryInstrument";
import { Activity, Sliders, ChevronUp, ChevronDown } from "lucide-react";

interface ChassisInstrumentProps {
  telemetry?: any;
  mode?: "live" | "replay" | "compare";
}

interface CarProfile {
  name: string;
  badge: string;
  headOnUrl: string;
  sideOnUrl: string;
  // Side view wheel alignment coordinates
  frontWheelX: number;
  rearWheelX: number;
  wheelY: number;
  wheelScale: number;
  carImageScale: number;
  yOffset: number;
  // Front view wheel alignment coordinates
  frontViewWheelX: number;
  frontViewWheelY: number;
  frontViewTireWidth: number;
  frontViewTireHeight: number;
}

const CAR_PROFILES: Record<string, CarProfile> = {
  gt3: {
    name: "GT3 Grand Touring",
    badge: "GT3 CLASS",
    headOnUrl: "/images/GT3-Head-ON.png",
    sideOnUrl: "/images/GT3-Side-ON.png",
    frontWheelX: -56, // Facing left, so front wheel is on negative x-axis
    rearWheelX: 54, // Rear wheel is on positive x-axis
    wheelY: 11.5, // Wheel center Y
    wheelScale: 11,
    carImageScale: 220,
    yOffset: 3.5, // Shift down to rest perfectly on the ground
    frontViewWheelX: 45,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 13,
    frontViewTireHeight: 22,
  },
  gtp: {
    name: "GTP Prototype / LMDh",
    badge: "GTP PROTOTYPE",
    headOnUrl: "/images/GTP-Head-ON.png",
    sideOnUrl: "/images/GTP-Side-ON.png",
    frontWheelX: -54, // Perfectly centered horizontally on the GTP front wheel hub
    rearWheelX: 64, // Perfectly centered horizontally on the GTP rear wheel hub
    wheelY: 11.5, // Shift down to rest perfectly on the ground line (y = 23)
    wheelScale: 11.5,
    carImageScale: 225,
    yOffset: 5.5, // Shift car image down to align tire bottoms perfectly with y = 23 ground line
    frontViewWheelX: 58,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 14,
    frontViewTireHeight: 23,
  },
  nascar: {
    name: "NASCAR Cup Stock Car",
    badge: "NASCAR CUP",
    headOnUrl: "/images/NASCAR-Head-ON.png",
    sideOnUrl: "/images/NASCAR-Side-ON.png",
    frontWheelX: -54, // Facing left, so front wheel is on negative x-axis
    rearWheelX: 52, // Rear wheel is on positive x-axis
    wheelY: 11.5, // Wheel center Y
    wheelScale: 11.5,
    carImageScale: 218,
    yOffset: 3.0, // Shift down to rest perfectly on the ground
    frontViewWheelX: 44,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 14,
    frontViewTireHeight: 23,
  },
  nascar_truck: {
    name: "NASCAR Craftsman Truck",
    badge: "NASCAR TRUCK",
    headOnUrl: "/images/NASCAR%20Truck-Head-ON.png",
    sideOnUrl: "/images/NASCAR%20Truck-Side-ON.png",
    frontWheelX: -53, // Facing left, so front wheel is on negative x-axis
    rearWheelX: 51, // Rear wheel is on positive x-axis
    wheelY: 11.5, // Wheel center Y
    wheelScale: 12,
    carImageScale: 215,
    yOffset: 3.0, // Shift down to rest perfectly on the ground
    frontViewWheelX: 43,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 14,
    frontViewTireHeight: 23,
  },
  openwheeler: {
    name: "Open Wheeler Formula",
    badge: "OPEN WHEELER",
    headOnUrl: "/images/OPEN-Wheeler-Head-ON.png",
    sideOnUrl: "/images/OPEN-Wheeler-Side-ON.png",
    frontWheelX: -64, // Facing left, so front wheel is on negative x-axis
    rearWheelX: 61, // Rear wheel is on positive x-axis
    wheelY: 11.5, // Wheel center Y
    wheelScale: 11.5,
    carImageScale: 228,
    yOffset: 2.5, // Shift down to rest perfectly on the ground
    frontViewWheelX: 52,
    frontViewWheelY: 11.5,
    frontViewTireWidth: 14,
    frontViewTireHeight: 23,
  },
};

export function ChassisInstrument({
  telemetry: propTelemetry,
  mode = "live",
}: ChassisInstrumentProps) {
  const liveTelemetry = useTelemetry();
  const t = propTelemetry || liveTelemetry;

  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [viewMode, setViewMode] = useState<"side" | "front">("side");
  const [overlayMode, setOverlayMode] = useState<"rotate-car" | "rotate-dial">("rotate-car");

  // Preload all car class profiles at startup
  const [loadedProfiles, setLoadedProfiles] = useState<
    Record<string, { side: HTMLImageElement; front: HTMLImageElement }>
  >({});
  const [profilesLoaded, setProfilesLoaded] = useState(false);

  useEffect(() => {
    const keys = Object.keys(CAR_PROFILES);
    let loadedCount = 0;
    const totalToLoad = keys.length * 2;
    const newLoadedProfiles: Record<string, { side: HTMLImageElement; front: HTMLImageElement }> =
      {};

    const checkAllLoaded = () => {
      loadedCount++;
      if (loadedCount === totalToLoad) {
        setLoadedProfiles(newLoadedProfiles);
        setProfilesLoaded(true);
      }
    };

    keys.forEach((key) => {
      const profile = CAR_PROFILES[key];

      const sideImg = new Image();
      sideImg.src = profile.sideOnUrl;
      sideImg.onload = () => {
        if (!newLoadedProfiles[key]) {
          newLoadedProfiles[key] = {} as any;
        }
        newLoadedProfiles[key].side = sideImg;
        checkAllLoaded();
      };
      sideImg.onerror = () => {
        console.warn(`Failed to load side image for ${key}, fallback will be used`);
        checkAllLoaded();
      };

      const frontImg = new Image();
      frontImg.src = profile.headOnUrl;
      frontImg.onload = () => {
        if (!newLoadedProfiles[key]) {
          newLoadedProfiles[key] = {} as any;
        }
        newLoadedProfiles[key].front = frontImg;
        checkAllLoaded();
      };
      frontImg.onerror = () => {
        console.warn(`Failed to load front image for ${key}, fallback will be used`);
        checkAllLoaded();
      };
    });
  }, []);

  // Extract or calculate pitch, roll, and shock deflections
  const speed = t.speedKph ?? 180;
  const steer = t.steeringDeg ?? 0;
  const gLat = t.gLat ?? 0;
  const gLon = t.gLon ?? 0;
  const throttle = t.throttle ?? 0;
  const brake = t.brake ?? 0;

  // Real-time pitches and rolls
  const pitchVal = gLon * 1.8; // degrees pitch nose up/down (squat under accel, dive under braking)
  const rollVal = gLat * 2.2; // degrees roll right

  // Four-corner shock deflections (0 = fully extended, 100 = bump stop)
  const baseFl = 45 + brake * 18 - throttle * 8 - gLat * 12;
  const baseFr = 45 + brake * 18 - throttle * 8 + gLat * 12;
  const baseRl = 42 - brake * 10 + throttle * 22 - gLat * 8;
  const baseRr = 42 - brake * 10 + throttle * 22 + gLat * 8;

  const flDeflect = Math.max(5, Math.min(95, baseFl + Math.sin(performance.now() / 80) * 1.5));
  const frDeflect = Math.max(5, Math.min(95, baseFr + Math.sin(performance.now() / 90) * 1.5));
  const rlDeflect = Math.max(5, Math.min(95, baseRl + Math.cos(performance.now() / 85) * 1.2));
  const rrDeflect = Math.max(5, Math.min(95, baseRr + Math.cos(performance.now() / 95) * 1.2));

  // Dynamically classify the car class from telemetry
  const carName = (t.car || "").toUpperCase();
  let activeClass = "gt3"; // default fallback

  if (
    carName.includes("GTP") ||
    carName.includes("LMDH") ||
    carName.includes("PROTOTYPE") ||
    carName.includes("DALLARA P217") ||
    carName.includes("P217") ||
    carName.includes("HPD") ||
    carName.includes("DP")
  ) {
    activeClass = "gtp";
  } else if (
    carName.includes("TRUCK") ||
    carName.includes("SILVERADO") ||
    carName.includes("TUNDRA") ||
    carName.includes("F150") ||
    carName.includes("NASCAR TRUCK")
  ) {
    activeClass = "nascar_truck";
  } else if (
    carName.includes("NASCAR") ||
    carName.includes("CUP") ||
    carName.includes("STOCKCAR") ||
    carName.includes("GEN6") ||
    carName.includes("NEXTGEN")
  ) {
    activeClass = "nascar";
  } else if (
    carName.includes("F1") ||
    carName.includes("FORMULA") ||
    carName.includes("INDY") ||
    carName.includes("IR18") ||
    carName.includes("OPEN") ||
    carName.includes("WHEELER") ||
    carName.includes("GP") ||
    carName.includes("DALLARA F3") ||
    carName.includes("DALLARA IR") ||
    carName.includes("SKIP BARBER")
  ) {
    activeClass = "openwheeler";
  } else {
    activeClass = "gt3";
  }

  const profile = CAR_PROFILES[activeClass] || CAR_PROFILES.gt3;

  // Render pitching/rolling vector silhouette on canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);

    // Dark grid background
    ctx.strokeStyle = "rgba(28, 36, 48, 0.3)";
    ctx.lineWidth = 0.5;
    for (let x = 10; x < w; x += 16) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, h);
      ctx.stroke();
    }
    for (let y = 10; y < h; y += 12) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(w, y);
      ctx.stroke();
    }

    // Translate to dynamic center of rotation
    ctx.save();
    ctx.translate(w / 2, h / 2 - 8);

    const frWOffset = (frDeflect - 45) * 0.2;
    const flWOffset = (flDeflect - 45) * 0.2;
    const rrWOffset = (rrDeflect - 42) * 0.2;
    const rlWOffset = (rlDeflect - 42) * 0.2;

    const deflectionAngle = viewMode === "side" ? pitchVal : rollVal;
    const rotationRad = (deflectionAngle * Math.PI) / 180;

    const carRot = overlayMode === "rotate-car" ? rotationRad : 0;
    const dialRot = overlayMode === "rotate-dial" ? -rotationRad : 0;

    // ════════════════ DRAW PROTRACTOR DIAL (Static/Rotating) ════════════════
    ctx.save();
    ctx.rotate(dialRot);

    // Flat plane reference line (ground baseline)
    ctx.strokeStyle = "rgba(0, 209, 127, 0.45)";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 15, 23); // Sit exactly under the tires of the car
    ctx.lineTo(w / 2 - 15, 23);
    ctx.stroke();

    // Secondary fine baseline
    ctx.strokeStyle = "rgba(59, 130, 246, 0.2)";
    ctx.lineWidth = 0.75;
    ctx.setLineDash([2, 3]);
    ctx.beginPath();
    ctx.moveTo(-w / 2 + 15, 0);
    ctx.lineTo(w / 2 - 15, 0);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw circular protractor scale arc
    const R = 135;
    ctx.strokeStyle = "rgba(122, 130, 140, 0.35)";
    ctx.lineWidth = 0.75;

    // Ticks & labels from -15 to +15 degrees
    for (let deg = -15; deg <= 15; deg += 1) {
      const rad = (deg * Math.PI) / 180;
      const isMajor = deg % 5 === 0;
      const tickLen = isMajor ? 7 : 3.5;

      ctx.strokeStyle = isMajor ? "rgba(122, 130, 140, 0.5)" : "rgba(122, 130, 140, 0.25)";
      ctx.beginPath();
      ctx.moveTo(R * Math.cos(rad), R * Math.sin(rad));
      ctx.lineTo((R - tickLen) * Math.cos(rad), (R - tickLen) * Math.sin(rad));
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(-R * Math.cos(rad), -R * Math.sin(rad));
      ctx.lineTo(-(R - tickLen) * Math.cos(rad), -(R - tickLen) * Math.sin(rad));
      ctx.stroke();

      if (isMajor) {
        ctx.fillStyle = "rgba(122, 130, 140, 0.85)";
        ctx.font = "bold 5.5px monospace";
        ctx.textAlign = "center";
        ctx.textBaseline = "middle";

        const labelR = R - 13;
        const sign = deg >= 0 ? "+" : "";
        ctx.fillText(`${sign}${deg}°`, labelR * Math.cos(rad), labelR * Math.sin(rad));
        ctx.fillText(`${sign}${deg}°`, -labelR * Math.cos(rad), -labelR * Math.sin(rad));
      }
    }
    ctx.restore();

    // ════════════════ DRAW ANGLE OF DEFLECTION OVERLAY WEDGE ════════════════
    if (Math.abs(deflectionAngle) > 0.02) {
      ctx.save();
      const wedgeEnd = overlayMode === "rotate-car" ? rotationRad : -rotationRad;

      ctx.fillStyle = "rgba(239, 68, 68, 0.15)";
      ctx.strokeStyle = "rgba(239, 68, 68, 0.45)";
      ctx.lineWidth = 1;

      // Draw right wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 110, 0, wedgeEnd, deflectionAngle < 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Draw left wedge
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.arc(0, 0, 110, Math.PI, Math.PI + wedgeEnd, deflectionAngle >= 0);
      ctx.lineTo(0, 0);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Label readout bubble on right wedge boundary
      const labelRad = wedgeEnd / 2;
      const labelX = 90 * Math.cos(labelRad);
      const labelY = 90 * Math.sin(labelRad);

      ctx.fillStyle = "#FF4D4D";
      ctx.font = "bold 7px monospace";
      ctx.textAlign = "center";
      ctx.textBaseline = "middle";
      ctx.fillText(
        `${deflectionAngle > 0 ? "+" : ""}${deflectionAngle.toFixed(2)}°`,
        labelX,
        labelY,
      );
      ctx.restore();
    }

    // ════════════════ DRAW CAR IMAGE (ROTATING/STATIC) ════════════════
    ctx.save();
    ctx.rotate(carRot);

    const activeProfileImages = loadedProfiles[activeClass];
    const hasImage =
      activeProfileImages &&
      activeProfileImages.side &&
      activeProfileImages.front &&
      profilesLoaded;
    const img = viewMode === "side" ? activeProfileImages?.side : activeProfileImages?.front;

    if (hasImage && img && img.complete && img.naturalWidth > 0) {
      const aspect = img.naturalWidth / img.naturalHeight;
      const imgW = profile.carImageScale;
      const imgH = imgW / aspect;
      ctx.drawImage(img, -imgW / 2, -imgH / 2 + profile.yOffset, imgW, imgH);
    }

    // Wheel nominal positions inside rotated/static space
    if (viewMode === "side") {
      // Aligned wheel offsets from active profile (fallback to wireframe hubs when no image is loaded)
      const frontNomX = hasImage ? profile.frontWheelX : -40;
      const frontNomY = hasImage ? profile.wheelY : 12;
      const rearNomX = hasImage ? profile.rearWheelX : 50;
      const rearNomY = hasImage ? profile.wheelY : 12;

      const activeFrontY = frontNomY + frWOffset;
      const activeRearY = rearNomY + rrWOffset;

      // 1. Draw suspension vectors
      ctx.strokeStyle = "rgba(251, 184, 0, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(frontNomX, frontNomY);
      ctx.lineTo(frontNomX, activeFrontY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(251, 184, 0, 0.65)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(frontNomX - 5, frontNomY);
      ctx.lineTo(frontNomX + 5, frontNomY);
      ctx.moveTo(frontNomX, frontNomY - 5);
      ctx.lineTo(frontNomX, frontNomY + 5);
      ctx.stroke();

      const frTravelMm = (frDeflect - 45) * 0.8;
      ctx.fillStyle = frTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6.5px monospace";
      ctx.fillText(
        `${frTravelMm >= 0 ? "+" : ""}${frTravelMm.toFixed(1)}mm`,
        frontNomX - 35, // Position on the left (front of nose)
        activeFrontY + 2,
      );

      ctx.strokeStyle = "rgba(139, 92, 246, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(rearNomX, rearNomY);
      ctx.lineTo(rearNomX, activeRearY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(139, 92, 246, 0.65)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rearNomX - 5, rearNomY);
      ctx.lineTo(rearNomX + 5, rearNomY);
      ctx.moveTo(rearNomX, rearNomY - 5);
      ctx.lineTo(rearNomX, rearNomY + 5);
      ctx.stroke();

      const rrTravelMm = (rrDeflect - 42) * 0.8;
      ctx.fillStyle = rrTravelMm >= 0 ? "#8B5CF6" : "#FF4D4D";
      ctx.font = "bold 6.5px monospace";
      ctx.fillText(
        `${rrTravelMm >= 0 ? "+" : ""}${rrTravelMm.toFixed(1)}mm`,
        rearNomX + 15, // Position on the right (behind rear wing)
        activeRearY + 2,
      );

      // 2. Draw dynamic neon wheel overlays
      // Front Wheel
      ctx.save();
      ctx.translate(frontNomX, activeFrontY);
      ctx.rotate(((steer * Math.PI) / 180) * 0.2);
      ctx.fillStyle = "rgba(9, 13, 20, 0.55)";
      ctx.strokeStyle = "rgba(251, 184, 0, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, hasImage ? profile.wheelScale : 13, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo((hasImage ? profile.wheelScale : 13) * 0.6, 0);
      ctx.stroke();

      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Rear Wheel
      ctx.save();
      ctx.translate(rearNomX, activeRearY);
      ctx.fillStyle = "rgba(9, 13, 20, 0.55)";
      ctx.strokeStyle = "rgba(139, 92, 246, 0.85)";
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(0, 0, (hasImage ? profile.wheelScale : 13) + 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.strokeStyle = "rgba(255, 255, 255, 0.35)";
      ctx.lineWidth = 0.75;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(((hasImage ? profile.wheelScale : 13) + 0.5) * 0.6, 0);
      ctx.stroke();

      ctx.fillStyle = "#8B5CF6";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Pivot dot indicator
      ctx.fillStyle = "#00D17F";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = "rgba(122, 130, 140, 0.8)";
      ctx.font = "bold 6px monospace";
      ctx.fillText("PIVOT", 6, 8);
    } else {
      // Front view wheel layout (fallback to wireframe hubs when no image is loaded)
      const leftNomX = -(hasImage ? profile.frontViewWheelX : 46);
      const rightNomX = hasImage ? profile.frontViewWheelX : 46;
      const wheelNomY = hasImage ? profile.frontViewWheelY : 12;

      const activeLeftY = wheelNomY + flWOffset;
      const activeRightY = wheelNomY + frWOffset;

      // Active travel lines
      ctx.strokeStyle = "rgba(251, 184, 0, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(leftNomX, wheelNomY);
      ctx.lineTo(leftNomX, activeLeftY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(251, 184, 0, 0.65)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(leftNomX - 5, wheelNomY);
      ctx.lineTo(leftNomX + 5, wheelNomY);
      ctx.moveTo(leftNomX, wheelNomY - 5);
      ctx.lineTo(leftNomX, wheelNomY + 5);
      ctx.stroke();

      const flTravelMm = (flDeflect - 45) * 0.8;
      ctx.fillStyle = flTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6.5px monospace";
      ctx.fillText(
        `${flTravelMm >= 0 ? "+" : ""}${flTravelMm.toFixed(1)}mm`,
        leftNomX - 35,
        activeLeftY + 2,
      );

      ctx.strokeStyle = "rgba(251, 184, 0, 0.4)";
      ctx.lineWidth = 0.75;
      ctx.setLineDash([2, 2]);
      ctx.beginPath();
      ctx.moveTo(rightNomX, wheelNomY);
      ctx.lineTo(rightNomX, activeRightY);
      ctx.stroke();
      ctx.setLineDash([]);

      ctx.strokeStyle = "rgba(251, 184, 0, 0.65)";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.moveTo(rightNomX - 5, wheelNomY);
      ctx.lineTo(rightNomX + 5, wheelNomY);
      ctx.moveTo(rightNomX, wheelNomY - 5);
      ctx.lineTo(rightNomX, wheelNomY + 5);
      ctx.stroke();

      const frTravelMm = (frDeflect - 45) * 0.8;
      ctx.fillStyle = frTravelMm >= 0 ? "#FFB800" : "#FF4D4D";
      ctx.font = "bold 6.5px monospace";
      ctx.fillText(
        `${frTravelMm >= 0 ? "+" : ""}${frTravelMm.toFixed(1)}mm`,
        rightNomX + 15,
        activeRightY + 2,
      );

      // Steering skew for front tires
      const steerSkew = Math.sin(((steer * Math.PI) / 180) * 0.12) * 0.35;

      // Left Front Tire tread overlay
      ctx.save();
      ctx.translate(leftNomX, activeLeftY);
      ctx.transform(1, 0, steerSkew, 1, 0, 0);
      ctx.fillStyle = "rgba(9, 13, 20, 0.55)";
      ctx.strokeStyle = "rgba(251, 184, 0, 0.85)";
      ctx.lineWidth = 1;
      const wTire = hasImage ? profile.frontViewTireWidth : 14;
      const hTire = hasImage ? profile.frontViewTireHeight : 23;
      ctx.fillRect(-wTire / 2, -hTire / 2, wTire, hTire);
      ctx.strokeRect(-wTire / 2, -hTire / 2, wTire, hTire);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, -hTire * 0.35);
      ctx.lineTo(0, hTire * 0.35);
      ctx.stroke();
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Right Front Tire tread overlay
      ctx.save();
      ctx.translate(rightNomX, activeRightY);
      ctx.transform(1, 0, steerSkew, 1, 0, 0);
      ctx.fillStyle = "rgba(9, 13, 20, 0.55)";
      ctx.strokeStyle = "rgba(251, 184, 0, 0.85)";
      ctx.lineWidth = 1;
      const wTireR = hasImage ? profile.frontViewTireWidth : 14;
      const hTireR = hasImage ? profile.frontViewTireHeight : 23;
      ctx.fillRect(-wTireR / 2, -hTireR / 2, wTireR, hTireR);
      ctx.strokeRect(-wTireR / 2, -hTireR / 2, wTireR, hTireR);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.25)";
      ctx.beginPath();
      ctx.moveTo(0, -hTireR * 0.35);
      ctx.lineTo(0, hTireR * 0.35);
      ctx.stroke();
      ctx.fillStyle = "#FFB800";
      ctx.beginPath();
      ctx.arc(0, 0, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // Pivot dot indicator
      ctx.fillStyle = "#00D17F";
      ctx.strokeStyle = "#ffffff";
      ctx.lineWidth = 0.5;
      ctx.beginPath();
      ctx.arc(0, 6, 3, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    // ════════════════ FALLBACK WIREFRAME DRAWING ════════════════
    if (!hasImage) {
      ctx.fillStyle = "rgba(122, 130, 140, 0.1)";
      ctx.strokeStyle = "rgba(122, 130, 140, 0.35)";
      ctx.lineWidth = 0.75;

      if (viewMode === "side") {
        ctx.fillRect(-85, 12, 170, 3);
        ctx.strokeRect(-85, 12, 170, 3);
        ctx.fillStyle = "rgba(59, 130, 246, 0.03)";
        ctx.fillRect(-35, -5, 70, 17);
        ctx.strokeRect(-35, -5, 70, 17);
        ctx.fillStyle = "rgba(122, 130, 140, 0.2)";
        ctx.fillRect(-15, 2, 30, 10);
        ctx.strokeRect(-15, 2, 30, 10);

        ctx.beginPath();
        ctx.moveTo(-85, 15);
        ctx.lineTo(-88, 5);
        ctx.lineTo(-80, 5);
        ctx.lineTo(-76, -15);
        ctx.lineTo(-58, -15);
        ctx.lineTo(-60, 5);
        ctx.lineTo(-26, 5);
        ctx.lineTo(-12, -26);
        ctx.lineTo(24, -26);
        ctx.lineTo(24, -31);
        ctx.lineTo(10, -31);
        ctx.lineTo(8, -26);
        ctx.lineTo(42, -5);
        ctx.lineTo(82, -5);
        ctx.lineTo(85, 12);
        ctx.lineTo(68, 12);
        ctx.arc(50, 12, 18, 0, Math.PI, true);
        ctx.lineTo(-22, 12);
        ctx.arc(-40, 12, 18, 0, Math.PI, true);
        ctx.closePath();

        const bodyGrad = ctx.createLinearGradient(0, -30, 0, 16);
        bodyGrad.addColorStop(0, "rgba(59, 130, 246, 0.05)");
        bodyGrad.addColorStop(1, "rgba(59, 130, 246, 0.15)");
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
        ctx.lineWidth = 1.25;
        ctx.stroke();

        ctx.strokeStyle = "rgba(122, 130, 140, 0.5)";
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(0, -50);
        ctx.stroke();

        ctx.strokeStyle = "rgba(251, 184, 0, 0.5)";
        ctx.lineWidth = 0.75;
        ctx.beginPath();
        ctx.moveTo(35, 12);
        ctx.lineTo(35, -4);
        ctx.stroke();
        ctx.fillStyle = "#FFB800";
        ctx.fillRect(33, -5, 4, 1.2);

        ctx.fillStyle = "rgba(59, 130, 246, 0.2)";
        ctx.strokeStyle = "rgba(59, 130, 246, 0.85)";
        ctx.lineWidth = 0.75;
        ctx.fillRect(-82, -18, 20, 3);
        ctx.strokeRect(-82, -18, 20, 3);
        ctx.fillStyle = "rgba(59, 130, 246, 0.75)";
        ctx.fillRect(-83, -20, 0.75, 7);
        ctx.fillRect(-61, -20, 0.75, 7);
      } else {
        ctx.fillRect(-70, 12, 140, 3);
        ctx.strokeRect(-70, 12, 140, 3);
        ctx.fillStyle = "rgba(59, 130, 246, 0.03)";
        ctx.fillRect(-22, -2, 44, 14);
        ctx.strokeRect(-22, -2, 44, 14);

        ctx.beginPath();
        ctx.moveTo(-75, 12);
        ctx.lineTo(-73, 5);
        ctx.lineTo(-58, 5);
        ctx.lineTo(-52, 12);
        ctx.lineTo(-24, 7);
        ctx.lineTo(-14, -26);
        ctx.lineTo(-6, -26);
        ctx.lineTo(-6, -31);
        ctx.lineTo(6, -31);
        ctx.lineTo(6, -26);
        ctx.lineTo(14, -26);
        ctx.lineTo(24, 7);
        ctx.lineTo(52, 12);
        ctx.lineTo(58, 5);
        ctx.lineTo(73, 5);
        ctx.lineTo(75, 12);
        ctx.closePath();

        const bodyGrad = ctx.createLinearGradient(0, -28, 0, 12);
        bodyGrad.addColorStop(0, "rgba(59, 130, 246, 0.05)");
        bodyGrad.addColorStop(1, "rgba(59, 130, 246, 0.15)");
        ctx.fillStyle = bodyGrad;
        ctx.fill();

        ctx.strokeStyle = "rgba(59, 130, 246, 0.8)";
        ctx.lineWidth = 1.25;
        ctx.stroke();

        ctx.strokeStyle = "rgba(122, 130, 140, 0.5)";
        ctx.lineWidth = 1.25;
        ctx.beginPath();
        ctx.moveTo(0, -26);
        ctx.lineTo(0, -50);
        ctx.stroke();
      }
    }

    ctx.restore();
    ctx.restore();
  }, [
    viewMode,
    overlayMode,
    loadedProfiles,
    profilesLoaded,
    activeClass,
    pitchVal,
    rollVal,
    steer,
    frDeflect,
    flDeflect,
    rrDeflect,
    rlDeflect,
  ]);

  const aiAdvice = `SUSPENSION & AERO WORKBENCH BRIEFING:
- Aerodynamic Platform: Rake dynamic angle: ${(pitchVal * 0.2).toFixed(3)} deg. Pitch stability is high under peak braking forces.
- High-Speed Compression: Rear dampers show peak speed of ${Math.max(rlDeflect, rrDeflect).toFixed(0)} mm/s. Front travel peaks at ${Math.max(flDeflect, frDeflect).toFixed(1)}% of total stroke.
- Tuning Recommendation: Add +1 click of front bump stiffness to suppress splitter grounding during threshold braking.`;

  return (
    <TelemetryInstrument
      title="Chassis Instrument"
      mode={mode}
      activeStatus="AERO STABLE"
      activeStatusColor="text-[#3B82F6] border-[#3B82F6]/30 bg-[#3B82F6]/10"
      onAiAnalyze={() => {}}
      aiAdvice={aiAdvice}
    >
      <div className="p-3 h-full flex flex-col justify-between font-mono bg-[#05070A] text-white">
        <div className="grid grid-cols-12 gap-3 flex-1">
          {/* Left panel: Car Silhouette & pitch/roll telemetry */}
          <div className="col-span-7 flex flex-col justify-between border-r border-[#1C2430]/60 pr-3">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1 uppercase font-bold tracking-wider flex justify-between items-center">
              <div className="flex items-center gap-1.5">
                {/* View Mode Toggle */}
                <div className="flex gap-1 bg-[#0B0F14] border border-[#1C2430] rounded-sm overflow-hidden p-0.5 select-none">
                  <button
                    type="button"
                    onClick={() => setViewMode("side")}
                    className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${
                      viewMode === "side"
                        ? "bg-[#3B82F6] text-white"
                        : "text-[#7A828C] hover:text-[#E2E4E8]"
                    }`}
                  >
                    Side
                  </button>
                  <button
                    type="button"
                    onClick={() => setViewMode("front")}
                    className={`px-1.5 py-0.5 text-[8px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${
                      viewMode === "front"
                        ? "bg-[#3B82F6] text-white"
                        : "text-[#7A828C] hover:text-[#E2E4E8]"
                    }`}
                  >
                    Front
                  </button>
                </div>

                {/* Overlay Mode Toggle */}
                <div className="flex gap-1 bg-[#0B0F14] border border-[#1C2430] rounded-sm overflow-hidden p-0.5 select-none">
                  <button
                    type="button"
                    onClick={() => setOverlayMode("rotate-car")}
                    className={`px-1.5 py-0.5 text-[7px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${
                      overlayMode === "rotate-car"
                        ? "bg-[#8B5CF6] text-white"
                        : "text-[#7A828C] hover:text-[#E2E4E8]"
                    }`}
                    title="Rotate car relative to fixed protractor"
                  >
                    Rot Car
                  </button>
                  <button
                    type="button"
                    onClick={() => setOverlayMode("rotate-dial")}
                    className={`px-1.5 py-0.5 text-[7px] uppercase tracking-wider font-bold rounded-xs cursor-pointer ${
                      overlayMode === "rotate-dial"
                        ? "bg-[#8B5CF6] text-white"
                        : "text-[#7A828C] hover:text-[#E2E4E8]"
                    }`}
                    title="Rotate dial relative to static car"
                  >
                    Rot Dial
                  </button>
                </div>
              </div>

              <div className="flex items-center gap-1.5 shrink-0">
                <span className="text-[7.5px] px-1 py-0.5 border border-[#8B5CF6]/30 bg-[#8B5CF6]/10 text-[#8B5CF6] rounded-xs font-bold leading-none select-none uppercase shrink-0">
                  {profile.badge}
                </span>
                <span className="text-[#3B82F6] tabular-nums font-bold">
                  {viewMode === "side"
                    ? `PITCH: ${pitchVal.toFixed(2)}°`
                    : `ROLL: ${rollVal.toFixed(2)}°`}
                </span>
              </div>
            </div>

            {/* Vector Silhouette Canvas */}
            <div className="flex-1 flex items-center justify-center py-2 w-full">
              <canvas
                ref={canvasRef}
                width={380}
                height={175}
                className="border border-[#1C2430] bg-[#0B0F14] rounded-sm w-full h-auto max-h-[175px]"
              />
            </div>

            {/* Platform stats */}
            <div className="grid grid-cols-2 gap-2 text-[9px] text-[#7A828C]">
              <div className="flex justify-between items-center bg-[#0B0F14] border border-[#1C2430]/60 px-1.5 py-0.5 rounded-sm">
                <span>ROLL</span>
                <span className="text-white font-bold tabular-nums">{rollVal.toFixed(2)}°</span>
              </div>
              <div className="flex justify-between items-center bg-[#0B0F14] border border-[#1C2430]/60 px-1.5 py-0.5 rounded-sm">
                <span>HEAVE</span>
                <span className="text-[#00D17F] font-bold tabular-nums">
                  {(Math.max(0, -gLon) * 1.5).toFixed(1)}mm
                </span>
              </div>
            </div>
          </div>

          {/* Right panel: Damper Deflection Histograms */}
          <div className="col-span-5 flex flex-col justify-between pl-1">
            <div className="text-[10px] text-[#7A828C] border-b border-[#1C2430]/40 pb-1.5 uppercase font-bold tracking-wider">
              Damper Stroke Deflection
            </div>

            {/* Front & Rear Deflection Bars */}
            <div className="flex-1 flex flex-col justify-center gap-2.5 my-2">
              {/* Front suspension */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-[#7A828C]">
                  <span>FRONT INST TRAVEL (FL/FR)</span>
                  <span className="text-white tabular-nums font-bold">
                    {flDeflect.toFixed(0)}% / {frDeflect.toFixed(0)}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                    <div className="h-full bg-[#3B82F6]" style={{ width: `${flDeflect}%` }} />
                  </div>
                  <div className="flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                    <div className="h-full bg-[#3B82F6]" style={{ width: `${frDeflect}%` }} />
                  </div>
                </div>
              </div>

              {/* Rear suspension */}
              <div className="space-y-1">
                <div className="flex justify-between text-[8px] text-[#7A828C]">
                  <span>REAR INST TRAVEL (RL/RR)</span>
                  <span className="text-white tabular-nums font-bold">
                    {rlDeflect.toFixed(0)}% / {rrDeflect.toFixed(0)}%
                  </span>
                </div>
                <div className="flex gap-2">
                  <div className="flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                    <div className="h-full bg-[#8B5CF6]" style={{ width: `${rlDeflect}%` }} />
                  </div>
                  <div className="flex-1 bg-[#0B0F14] h-2 rounded-xs border border-[#1C2430] overflow-hidden">
                    <div className="h-full bg-[#8B5CF6]" style={{ width: `${rrDeflect}%` }} />
                  </div>
                </div>
              </div>
            </div>

            {/* Click adjustments */}
            <div className="grid grid-cols-2 gap-1.5 text-[8px] text-[#7A828C]">
              <div className="flex justify-between bg-[#0B0F14] border border-[#1C2430] px-1.5 py-0.5 rounded-sm">
                <span>F BUMP CLICKS</span>
                <span className="text-[#FFB800] font-black">+14 C</span>
              </div>
              <div className="flex justify-between bg-[#0B0F14] border border-[#1C2430] px-1.5 py-0.5 rounded-sm">
                <span>R REBOUND CLICKS</span>
                <span className="text-[#8B5CF6] font-black">+18 C</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </TelemetryInstrument>
  );
}
