const BASE_LINK = 'https://las.op.gg/multi/query=';

function areCharsEqual(lines, position) {
	if (lines.length == 0 || lines[0].length < position) {
		return false;
	}
	const baseChar = lines[0][lines[0].length - 1 - position];
	return lines.reduce((result, line) =>
			result
			&& line.length >= position
			&& (line[line.length - 1 - position] == baseChar)
			, true);
}

function calculatePostfixLength(lines) {
	var total = 0;
	while (areCharsEqual(lines, total)) {
		total++;
	}
	return total;
}

function generateLink() {
	var link = BASE_LINK;
	const playersText = $('#players_in_game')[0].value;
	const playerLines = playersText.split('\n');
	const postfixLength = calculatePostfixLength(playerLines);
	playerLines.forEach(p => link += p.substring(0, p.length-postfixLength) + ',');
	return link;
};

function username() {
	return $('#summoner_name')[0].value;
}

function populateOPGGMultiLink(link) {
	const linkTextNode = $('#opgg_link');
	linkTextNode[0].innerHTML = `<a target="_blank" href="${link}">${link}</a>`;
}

$('document').ready(function() {
	$('#generate_link')[0].onclick = function() {
		populateOPGGMultiLink(generateLink());
	};
	$('#open_multiopgg')[0].onclick = function() {
		const link = generateLink();
		populateOPGGMultiLink(link);
		window.open(link);
	};
});
