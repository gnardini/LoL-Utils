var opn = require('opn');

const POSTFIX = 18

var link = 'https://las.op.gg/multi/query='
var total = 0

var stdin = process.openStdin();
stdin.addListener("data", function(d) {
	var l = d.toString().trim()
	link += l.substring(0, l.length-POSTFIX) + ','
	total++
	if (total == 5) {
		console.log('\n\n' + link)	
		opn(link);
	}
  });

console.log('Please paste the first lines of the game lobby.\n')