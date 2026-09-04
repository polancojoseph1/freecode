use std::process::Command;

fn main() {
    let sidecar = "echo";
    let args = "arg1 arg2; rm -rf /";

    let line = format!("\"{}\" {}", sidecar, args);
    let mut cmd = Command::new("sh");
    cmd.args(["-l", "-c", &line]);

    println!("Executing: sh -l -c {:?}", line);
}
