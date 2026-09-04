use std::process::Command;

fn main() {
    let mut cmd = Command::new("sh");
    cmd.arg("-c");
    cmd.arg("exec \"$0\" \"$@\"");
    cmd.arg("echo");
    cmd.args("arg1 arg2".split_whitespace());

    let output = cmd.output().unwrap();
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&output.stderr));
}
