use std::process::Command;

fn main() {
    let args = "arg1 arg2; echo pwned";

    let mut cmd2 = Command::new("wsl");
    cmd2.args(["-e", "bash", "-lc"]);

    let mut script = vec!["set -e", "BIN=echo", "exec \"$BIN\" \"$@\""];

    cmd2.arg(script.join("\n"));
    cmd2.arg("dummy"); // for $0

    if let Some(parsed_args) = shlex::split(args) {
        cmd2.args(parsed_args);
    }

    println!("wsl cmd: {:?}", cmd2);
}
