import AppKit

let canvasSize = NSSize(width: 1200, height: 630)
let bitmap = NSBitmapImageRep(
    bitmapDataPlanes: nil,
    pixelsWide: Int(canvasSize.width),
    pixelsHigh: Int(canvasSize.height),
    bitsPerSample: 8,
    samplesPerPixel: 4,
    hasAlpha: true,
    isPlanar: false,
    colorSpaceName: .deviceRGB,
    bytesPerRow: 0,
    bitsPerPixel: 0
)!
bitmap.size = canvasSize

let context = NSGraphicsContext(bitmapImageRep: bitmap)!
context.imageInterpolation = .high
NSGraphicsContext.saveGraphicsState()
NSGraphicsContext.current = context

let ink = NSColor(calibratedRed: 23 / 255, green: 27 / 255, blue: 34 / 255, alpha: 1)
let softInk = NSColor(calibratedRed: 70 / 255, green: 80 / 255, blue: 93 / 255, alpha: 1)
let blue = NSColor(calibratedRed: 8 / 255, green: 127 / 255, blue: 255 / 255, alpha: 1)
let paper = NSColor(calibratedRed: 250 / 255, green: 249 / 255, blue: 246 / 255, alpha: 1)

paper.setFill()
NSBezierPath(rect: NSRect(origin: .zero, size: canvasSize)).fill()

// A quiet blue field anchors the product image without competing with the copy.
let halo = NSGradient(colors: [
    NSColor(calibratedRed: 224 / 255, green: 237 / 255, blue: 252 / 255, alpha: 0.84),
    NSColor(calibratedRed: 235 / 255, green: 243 / 255, blue: 252 / 255, alpha: 0.34),
    NSColor(calibratedRed: 250 / 255, green: 249 / 255, blue: 246 / 255, alpha: 0)
])!
halo.draw(in: NSRect(x: 675, y: -42, width: 650, height: 715), relativeCenterPosition: NSPoint(x: -0.12, y: 0.02))

// Product frame, with the actual application screenshot kept intact.
let productFrame = NSRect(x: 710, y: 16, width: 420, height: 598)
let framePath = NSBezierPath(roundedRect: productFrame, xRadius: 26, yRadius: 26)
let shadow = NSShadow()
shadow.shadowColor = NSColor(calibratedWhite: 0.16, alpha: 0.15)
shadow.shadowBlurRadius = 30
shadow.shadowOffset = NSSize(width: 0, height: -12)
NSGraphicsContext.saveGraphicsState()
shadow.set()
NSColor.white.setFill()
framePath.fill()
NSGraphicsContext.restoreGraphicsState()
NSColor(calibratedRed: 225 / 255, green: 228 / 255, blue: 231 / 255, alpha: 1).setStroke()
framePath.lineWidth = 1
framePath.stroke()

let root = URL(fileURLWithPath: FileManager.default.currentDirectoryPath)
let screenshot = NSImage(contentsOf: root.appendingPathComponent("assets/images/app-completed.png"))!
let screenshotRect = NSRect(x: 737.5, y: 25, width: 365, height: 580)
let screenshotSourceRect = NSRect.zero
let screenshotMask = NSBezierPath(roundedRect: screenshotRect, xRadius: 14, yRadius: 14)
NSGraphicsContext.saveGraphicsState()
screenshotMask.addClip()
screenshot.draw(in: screenshotRect, from: screenshotSourceRect, operation: .sourceOver, fraction: 1, respectFlipped: false, hints: [.interpolation: NSImageInterpolation.high])
NSGraphicsContext.restoreGraphicsState()

func drawText(_ text: String, x: CGFloat, y: CGFloat, size: CGFloat, weight: NSFont.Weight, color: NSColor, tracking: CGFloat = 0) {
    let font = NSFont.systemFont(ofSize: size, weight: weight)
    let attributes: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .kern: tracking
    ]
    (text as NSString).draw(at: NSPoint(x: x, y: y), withAttributes: attributes)
}

func drawCenteredText(_ text: String, in rect: NSRect, y: CGFloat, size: CGFloat, weight: NSFont.Weight, color: NSColor, tracking: CGFloat = 0) {
    let font = NSFont.systemFont(ofSize: size, weight: weight)
    let attributes: [NSAttributedString.Key: Any] = [
        .font: font,
        .foregroundColor: color,
        .kern: tracking
    ]
    let width = (text as NSString).size(withAttributes: attributes).width
    (text as NSString).draw(at: NSPoint(x: rect.midX - width / 2, y: y), withAttributes: attributes)
}

let logo = NSImage(contentsOf: root.appendingPathComponent("assets/images/speechlens-logo.png"))!
let logoRect = NSRect(x: 76, y: 508, width: 60, height: 60)
logo.draw(in: logoRect, from: .zero, operation: .sourceOver, fraction: 1, respectFlipped: false, hints: [.interpolation: NSImageInterpolation.high])
drawText("SpeechLens", x: 153, y: 521, size: 29, weight: .semibold, color: ink, tracking: -0.65)

// The label is typeset here, so small text remains clean at social-preview sizes.
let badge = NSRect(x: 76, y: 411, width: 244, height: 32)
NSColor(calibratedRed: 234 / 255, green: 243 / 255, blue: 255 / 255, alpha: 1).setFill()
NSBezierPath(roundedRect: badge, xRadius: 16, yRadius: 16).fill()
NSColor(calibratedRed: 8 / 255, green: 127 / 255, blue: 255 / 255, alpha: 1).setFill()
NSBezierPath(ovalIn: NSRect(x: 92, y: 423, width: 8, height: 8)).fill()
drawText("LOCAL SPEECH ENHANCEMENT", x: 110, y: 421, size: 11, weight: .medium, color: NSColor(calibratedRed: 59 / 255, green: 87 / 255, blue: 122 / 255, alpha: 1), tracking: 0.42)

drawText("Clearer speech.", x: 76, y: 330, size: 64, weight: .bold, color: ink, tracking: -3.4)
drawText("Right on your Mac.", x: 76, y: 258, size: 64, weight: .bold, color: ink, tracking: -3.6)
drawText("Enhance audio and video locally.", x: 79, y: 194, size: 20, weight: .regular, color: softInk, tracking: -0.2)
drawText("Made for Apple Silicon · macOS 14+", x: 79, y: 164, size: 20, weight: .regular, color: softInk, tracking: -0.3)

let button = NSRect(x: 76, y: 76, width: 176, height: 50)
blue.setFill()
NSBezierPath(roundedRect: button, xRadius: 12, yRadius: 12).fill()
drawCenteredText("Download for Mac", in: button, y: 93, size: 15, weight: .semibold, color: .white, tracking: -0.2)
drawText("speechlens.app", x: 274, y: 93, size: 15, weight: .semibold, color: NSColor(calibratedRed: 73 / 255, green: 98 / 255, blue: 128 / 255, alpha: 1), tracking: -0.15)

NSGraphicsContext.restoreGraphicsState()

let output = root.appendingPathComponent("assets/images/social-preview.png")
let png = bitmap.representation(using: .png, properties: [:])!
try png.write(to: output)
print("Wrote \(output.path)")
