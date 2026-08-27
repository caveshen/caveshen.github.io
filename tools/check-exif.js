// hasExif(buffer) — true if the image carries an EXIF block (GPS lives inside
// EXIF as a sub-IFD, so clearing EXIF clears GPS too). Used by the
// threshold-photo unit test to verify shipped bytes carry no EXIF.
import sharp from 'sharp';

export async function hasExif(buffer) {
  const meta = await sharp(buffer).metadata();
  return meta.exif != null;
}
