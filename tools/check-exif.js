// hasExif(buffer) — true if the image carries an EXIF block (GPS lives inside
// EXIF as a sub-IFD, so clearing EXIF clears GPS too). Shared by
// tools/build-threshold-photo.mjs's self-check and the unit test.
import sharp from 'sharp';

export async function hasExif(buffer) {
  const meta = await sharp(buffer).metadata();
  return meta.exif != null;
}
