// @ts-check

import { execSync } from "child_process";

try {
	execSync("git submodule update --remote --merge --init --recursive", {
		stdio: "inherit"
	});
	execSync("git add *", {
		stdio: "inherit"
	});
	execSync("git commit -m '[automated] updated submodules'", {
		stdio: "inherit"
	});
} catch (e) {}
