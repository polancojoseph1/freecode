use std::process::Command;

fn main() {
    let mut cmd = Command::new("sh");
    cmd.arg("-c");
    cmd.arg("echo \"$0\" \"$@\"");
    cmd.arg("my_sidecar");
    cmd.arg("arg1");
    cmd.arg("arg2");

    let output = cmd.output().unwrap();
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
}
