// @ts-check

import { execSync } from "child_process";
import {
	copyFileSync,
	cpSync,
	mkdirSync,
	readdirSync,
	rmSync,
	statSync
} from "fs";
import { join } from "path";

/**
 *
 * @param {string} sourceDir
 */
function applyChanges(sourceDir) {
	const files = readdirSync(sourceDir);
	const filesToCopy = files.filter(f => !f.endsWith(".patch"));
	const patches = files.filter(f => f.endsWith(".patch"));
	for (const file of filesToCopy) {
		const path = join("working/", file.replaceAll("_", "/"));
		console.log("Copying", file, "to", path);
		cpSync(join(sourceDir, file), path, {
			recursive: true
		});
	}
	for (const patch of patches) {
		console.log("Applying patch", patch);
		execSync(`cd working && git apply ../${sourceDir}/${patch}`);
	}
}

function copyFiles(clientMod) {
	const dir = clientMod === "vencord" ? "working/dist" : "working/dist/browser";
	cpSync(`${dir}/browser.js`, "dist/browser.js", {
		recursive: true
	});
	cpSync(`${dir}/browser.css`, "dist/browser.css", {
		recursive: true
	});
	cpSync(`${dir}/browser.js.LEGAL.txt`, "dist/browser.js.LEGAL.txt", {
		recursive: true
	});
}

/**
 * @param {string} cloneURL
 * @param {string} clientMod
 */
export function buildVencord(cloneURL, clientMod) {
	if (
		!/^https:\/\/(github\.com|codeberg\.org|git\.nin0\.dev)\/[a-zA-Z0-9-]+\/[a-zA-Z0-9-\._]+(?:\.git)?\/?$/.test(
			cloneURL
		)
	) {
		throw new Error(
			"Invalid clone URL. Must be github, codeberg or nin0git"
		);
	}

	try {
		if (statSync("working/").isDirectory()) {
			console.log("Working dir exists, deleting");
			rmSync("working/", {
				force: true,
				recursive: true
			});
		}
	} catch {}
	console.log("Creating working dir");
	mkdirSync("working/");

	console.log(`Cloning ${cloneURL}`);
	execSync(
		`git clone --depth 1 --branch main ${cloneURL} working/`, // FIXME: clone more securely
		{
			stdio: "ignore"
		}
	);

	console.log("Installing Vencord deps");
	execSync("cd working && pnpm i --no-frozen-lockfile", {
		stdio: "inherit"
	});

	console.log("Applying common files");
	applyChanges("src/common");
	console.log("Applying", clientMod, "files");
	applyChanges(`src/${clientMod}`);

	console.log("Building Vencord");
	execSync("cd working && pnpm buildWeb", {
		stdio: "inherit"
	});

	console.log("Releasing");
	copyFiles(clientMod);
	execSync(
		`export GH_TOKEN=${process.env.GH_TOKEN} && gh release upload ${
			clientMod === "vencord" ? "devbuild" : "devbuild-equi"
		} --clobber dist/*`,
		{
			stdio: "ignore"
		}
	);
}
