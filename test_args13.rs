use std::process::Command;

fn main() {
    let mut cmd = Command::new("sh");
    cmd.arg("-l");
    cmd.arg("-c");
    cmd.arg("exec \"$0\" \"$@\"");
    cmd.arg("my_sidecar");

    let args_str = "arg1 arg2 \"with space\"";

    // shlex::split parses string to Vec<String>
    match shlex::split(args_str) {
        Some(parsed_args) => {
            cmd.args(parsed_args);
        }
        None => {
            println!("Failed to parse args!");
        }
    }

    println!("Command constructed: {:?}", cmd);
}
