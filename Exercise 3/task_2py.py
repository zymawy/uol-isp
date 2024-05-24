import numpy as np
import matplotlib.pyplot as plt
from scipy.io import wavfile

def detect_ultrasonic(filename):
    rate, data = wavfile.read(filename)
    spectrum = np.fft.fft(data)
    freqs = np.fft.fftfreq(len(spectrum))

    plt.plot(freqs, np.abs(spectrum))
    plt.title('Frequency Spectrum')
    plt.xlabel('Frequency (Hz)')
    plt.ylabel('Amplitude')
    plt.show()

detect_ultrasonic('Ex3_sounds/Ex3_sound2.wav')
detect_ultrasonic('Ex3_sounds/Ex3_sound3.wav')
detect_ultrasonic('Ex3_sounds/Ex3_sound4.wav')
