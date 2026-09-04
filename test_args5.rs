use std::process::Command;

fn main() {
    let mut cmd = Command::new("sh");
    cmd.args(["-l", "-c", "echo hello; whoami"]);

    let output = cmd.output().unwrap();
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&output.stderr));
}
