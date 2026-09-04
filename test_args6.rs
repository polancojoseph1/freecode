use std::process::Command;

fn main() {
    let mut cmd = Command::new("sh");
    cmd.arg("-c");
    let line = "echo $0 $@";
    cmd.arg(line);
    cmd.arg("my_sidecar");
    cmd.arg("arg1");
    cmd.arg("with space");
    cmd.arg("arg3");

    let output = cmd.output().unwrap();
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&output.stderr));
}
