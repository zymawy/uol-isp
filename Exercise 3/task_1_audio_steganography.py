# import wave
#
# def extract_lsb(filename):
#     with wave.open(filename, 'rb') as audio:
#         frames = bytearray(list(audio.readframes(audio.getnframes())))
#
#     message_bits = [frames[i] & 1 for i in range(len(frames))]
#     message_bytes = [message_bits[i:i + 8] for i in range(0, len(message_bits), 8)]
#     message = ''.join(chr(int(''.join(map(str, byte)), 2)) for byte in message_bytes)
#     return message
#
# hidden_message = extract_lsb('Ex3_sounds/Ex3_sound1.wav')
# print("Hidden message:", hidden_message)
#


import wave

import wave
import numpy as np


def extract_lsb_message(audio_path):
	# Open the audio file
	with wave.open(audio_path, 'rb') as audio:
		# Get parameters
		n_frames = audio.getnframes()
		n_channels = audio.getnchannels()
		sampwidth = audio.getsampwidth()

		# Read frames
		frames = audio.readframes(n_frames)

	# Convert frames to numpy array
	audio_samples = np.frombuffer(frames, dtype=np.int16)

	# Extract LSBs
	lsb_bits = [bin(sample)[-1] for sample in audio_samples]

	# Group bits into bytes and convert to characters
	message_bytes = [int(''.join(lsb_bits[i:i + 8]), 2) for i in
					 range(0, len(lsb_bits), 8)]
	message = ''.join([chr(byte) for byte in message_bytes if byte != 0])

	return message


# Extract and print the message
message = extract_lsb_message('Ex3_sounds/Ex3_sound1.wav')
print("Hidden Message:", message)


def extract_lsb(filename):
	with wave.open(filename, 'rb') as audio:
		frames = bytearray(list(audio.readframes(audio.getnframes())))

	message_bits = [frames[i] & 1 for i in range(len(frames))]
	message_bytes = [message_bits[i:i + 8] for i in
					 range(0, len(message_bits), 8)]
	message = ''.join(
		chr(int(''.join(map(str, byte)), 2)) for byte in message_bytes)

	# Cut off at the filler characters
	decoded_message = message.split("###")[0]
	return decoded_message
#
#
# hidden_message = extract_lsb('Ex3_sounds/Ex3_sound1.wav')
# print("Hidden message:", hidden_message)


#
# # Use wave package (native to Python) for reading the received audio file
# import wave
# song = wave.open("Ex3_sounds/Ex3_sound1.wav", mode='rb')
# # Convert audio to byte array
# frame_bytes = bytearray(list(song.readframes(song.getnframes())))
#
# # Extract the LSB of each byte
# extracted = [frame_bytes[i] & 1 for i in range(len(frame_bytes))]
# # Convert byte array back to string
# string = "".join(chr(int("".join(map(str,extracted[i:i+8])),2)) for i in range(0,len(extracted),8))
# # Cut off at the filler characters
# decoded = string.split("###")[0]
#
# # Print the extracted text
# print("Sucessfully decoded: "+decoded)
# song.close()
