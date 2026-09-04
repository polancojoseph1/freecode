use std::process::Command;

fn main() {
    let mut cmd = Command::new("sh");
    cmd.args(["-c", "echo \"\\$0\" \"\\$@\"", "my_sidecar", "arg1", "arg2"]);
    let output = cmd.output().unwrap();
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
}
