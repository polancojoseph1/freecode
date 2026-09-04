use std::process::Command;

fn main() {
    let mut cmd = Command::new("sh");
    cmd.args(["-l", "-c", "exec \"$0\" \"$@\""]);
    cmd.arg("my_sidecar");
    cmd.args("arg1 \"with space\" arg3".split_whitespace());

    let output = cmd.output().unwrap();
    println!("stdout: {}", String::from_utf8_lossy(&output.stdout));
    println!("stderr: {}", String::from_utf8_lossy(&output.stderr));
}
