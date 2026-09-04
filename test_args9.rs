use std::process::Command;

fn main() {
    let sidecar = "echo";
    let args = "arg1 arg2";

    let line = format!("\"{}\" {}", sidecar, args);
    let mut cmd = Command::new("sh");
    cmd.args(["-l", "-c", &line]);

    let output = cmd.output().unwrap();
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&output.stderr));
}
