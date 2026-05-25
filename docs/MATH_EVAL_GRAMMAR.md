# Math Evaluation Grammar

The Pit Wall Math Engine allows users to create derived channels using mathematical expressions. These expressions are evaluated per-tick using the telemetry values from the session.

## Variables

Any existing telemetry channel name can be used as a variable in an expression. For example: `Speed`, `RPM`, `Brake`, `Throttle`.
Variables are case-sensitive and must match the channel name exactly.

## Operators

The following operators are supported, in order of precedence (highest to lowest):

1. **Parentheses**: `(` and `)` for grouping
2. **Unary Minus / Unary Plus**: `-x` or `+x`
3. **Exponentiation**: `x ^ y`
4. **Multiplication / Division**: `x * y` or `x / y`
5. **Addition / Subtraction**: `x + y` or `x - y`

## Functions

The engine supports standard mathematical functions:

- `sin(x)`: Sine of x (radians)
- `cos(x)`: Cosine of x (radians)
- `tan(x)`: Tangent of x (radians)
- `asin(x)`: Arcsine of x
- `acos(x)`: Arccosine of x
- `atan(x)`: Arctangent of x
- `abs(x)`: Absolute value of x
- `sqrt(x)`: Square root of x
- `log(x)`: Natural logarithm of x
- `log10(x)`: Base-10 logarithm of x
- `exp(x)`: e raised to the power of x
- `floor(x)`: Largest integer less than or equal to x
- `ceil(x)`: Smallest integer greater than or equal to x
- `round(x)`: Round x to the nearest integer
- `min(x, y, ...)`: Minimum of a set of values
- `max(x, y, ...)`: Maximum of a set of values

## Conditionals (Ternary)

You can use ternary conditional operators:
`condition ? true_value : false_value`

Where `condition` can use comparison operators: `>`, `<`, `>=`, `<=`, `==`, `!=`
Example:
`Brake > 0 ? Speed : 0`

## Constants

- `PI`: 3.14159...
- `E`: 2.71828...

## Examples

- **Wheel Slip**: `Speed > 0 ? (Speed - (RPM * 0.1)) / Speed : 0`
- **G-Force Vector**: `sqrt((LatAccel * LatAccel) + (LongAccel * LongAccel))`
- **Brake Bias Proxy**: `BrakeFront / (BrakeFront + BrakeRear)`

## Evaluation

Math expressions are compiled into an Abstract Syntax Tree (AST) when the session loads or when the expression is updated. During graph rendering or playback, the AST is evaluated efficiently for each time tick using the telemetry array data.
