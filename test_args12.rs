use std::process::Command;

fn main() {
    let mut cmd = Command::new("sh");
    cmd.arg("-l");
    cmd.arg("-c");
    cmd.arg("exec \"$0\" \"$@\"");
    cmd.arg("echo");
    cmd.arg("arg1");
    cmd.arg("arg2");
    cmd.arg("arg with spaces");

    let output = cmd.output().unwrap();
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&output.stderr));
}
