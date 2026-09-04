use std::process::Command;

fn main() {
    let sidecar = "/my/path/to/sidecar";
    let args = "arg1 \"with space\" arg3";
    let line = format!("\"{}\" {}", sidecar, args);

    let mut cmd = Command::new("sh");
    cmd.args(["-l", "-c", &line]);

    println!("Executing: sh -l -c {:?}", line);
}
