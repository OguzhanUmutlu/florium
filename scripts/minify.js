import fs from "fs";
import * as terser from "terser";

function readdir(dir, r = []) {
    for (const file of fs.readdirSync(dir)) {
        const f = dir + "/" + file;
        if (fs.statSync(f).isFile()) r.push(f);
        else readdir(f, r);
    }
    return r;
}

const jsFiles = readdir("./dist").filter(file => file.endsWith(".js"));

for (const file of jsFiles) {
    const code = fs.readFileSync(file, "utf8");
    const result = await terser.minify(code, {
        mangle: true, compress: true
    });

    if (result.error) {
        console.error(`Error minifying ${file}: ${result.error}`);
    } else {
        fs.writeFileSync(file, result.code);
    }
}