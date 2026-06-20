// ICT-LIBRARY-OFFICE/backend/src/utils/logRotation.ts

import fs from "fs";
import path from "path";

export function rotateLogIfNeeded(
  filePath: string,
  maxSizeMB = 50,
  keepFiles = 3
) {

  const dir =
    path.dirname(filePath);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, {
      recursive: true
    });
  }

  if (!fs.existsSync(filePath)) {
    fs.writeFileSync(
      filePath,
      ""
    );
    return;
  }

  const stats = fs.statSync(filePath);

  const maxBytes =
    maxSizeMB * 1024 * 1024;

  if (stats.size < maxBytes) {
    return;
  }

  for (
    let i = keepFiles;
    i >= 1;
    i--
  ) {

    const oldFile =
      `${filePath}.${i}`;

    const newFile =
      `${filePath}.${i + 1}`;

    if (
      fs.existsSync(oldFile)
    ) {

      if (i === keepFiles) {
        fs.unlinkSync(oldFile);
      } else {
        fs.renameSync(
          oldFile,
          newFile
        );
      }

    }

  }

  fs.renameSync(
    filePath,
    `${filePath}.1`
  );

  fs.writeFileSync(
    filePath,
    ""
  );
}