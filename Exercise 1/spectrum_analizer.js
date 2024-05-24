document.title = "Spectrum Analizer";

let song;
let fft;
let maxX;

let filter;

function preload() {
	song = loadSound('assets/sounds/sound-track.wav');
}

function setup() {
	let cnv = createCanvas(900, 700);

	cnv.mouseClicked(() => 	song.play());


	let samples = 1 << 12;

	fft = new p5.FFT(0.8, samples);
	// filter = new p5.BandPass();
	filter = new p5.LowPass();
	// filter = new p5.HighPass();
	// song = new p5.Noise();

	filter.amp(1);

	maxX = 12 * ln2(samples);

	song.disconnect();
	song.connect(filter);
	// song.start();

	// console.log(song.connect);
}

function ln2(x) {
	return log(x) / log(2);
}

function isMouseOverCanvas() {
	let mx = mouseX;
	let my = mouseY;

	return 0 <= mx && mx <= width && 0 <= my && my <= height;
}

// let resolution = 100;

function draw() {
	background(0);

	if ( isMouseOverCanvas() ) {
		let freqs = map(mouseX, 0, width, 20, 10000);
		// let freq = map(12 * ln2(mouseX + 1), 0, maxX, 20, 10000);

		filter.freq(freqs);
		// filter.res( resolution );
		// console.log(resolution);
		song.amp(0.5, 0.2);
	} else {
		song.amp(0, 0.2);
	}

	let spectrum = fft.analyze();

	stroke(255);
	fill(255, 45, 45);

	beginShape();
	vertex(0, height);
	for (let i = 0, maxi = spectrum.length; i < maxi; i += 1) {
		let x = map(12 * ln2(i + 1), 0, maxX, 0, width);
		let amps = map(spectrum[i], 0, 300, height, 0);
		// let x = map(i, 0, maxi, 0, width);
		// let amp = -height + map(spectrum[i], 0, 255, height, 0);
		// line(i, height, i, height - amp);
		vertex(x, amps);
		// rect(x, height, width / maxi, amp);
	}
	vertex(width, height);
	// endShape(CLOSE);
	endShape();

}

// function keyPressed() {
//   let rinc = 3;
//   // console.log('KEY: ', key);
//   switch(key) {
//     case 'ArrowLeft': {
//       resolution -= rinc;
//       break;
//     }
//     case 'ArrowRight': {
//       resolution += rinc;
//       break;
//     }
//   }
// }
