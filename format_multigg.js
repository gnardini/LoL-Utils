const REGION = "las";
const URL = "https://$4 3{REGION}.op.gg/multi/query="

input = "ASD has joined.\nQWE has joined.\nZXC has joined.";

lines = input.split("\n");
names = [];
for (var index in lines) {
  line = lines[index];
  name = line.substring(0, line.length - 12);
  names.push(name)
}
console.log(names);
