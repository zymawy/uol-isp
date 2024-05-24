import wave


def embed_lsb_enhanced(audio_filename, string, output_filename):
	# We will use wave package available in native Python installation to read and write .wav audio file
	import wave
	# read wave audio file
	song = wave.open(audio_filename, mode='rb')
	# Read frames and convert to byte array
	frame_bytes = bytearray(list(song.readframes(song.getnframes())))

	# The "secret" text message
	string = 'Peter Parker is the Spiderman!'
	# Append dummy data to fill out rest of the bytes. Receiver shall detect and remove these characters.
	string = string + int((len(frame_bytes) - (len(string) * 8 * 8)) / 8) * '#'
	# Convert text to bit array
	bits = list(map(int, ''.join(
		[bin(ord(i)).lstrip('0b').rjust(8, '0') for i in string])))

	# Replace LSB of each byte of the audio data by one bit from the text bit array
	for i, bit in enumerate(bits):
		frame_bytes[i] = (frame_bytes[i] & 254) | bit
	# Get the modified bytes
	frame_modified = bytes(frame_bytes)

	# Write bytes to a new wave audio file
	with wave.open(output_filename, 'wb') as fd:
		fd.setparams(song.getparams())
		fd.writeframes(frame_modified)
	song.close()


embed_lsb_enhanced('Ex3_sounds/Ex3_sound5.wav', 'Father Christmas does not exist',
				   'output.wav')


def extract_lsb_enhanced(file):
	song = wave.open(file, mode='rb')
	# Use wave package (native to Python) for reading the received audio file
	# import wave	# Convert audio to byte array
	frame_bytes = bytearray(list(song.readframes(song.getnframes())))

	# Extract the LSB of each byte
	extracted = [frame_bytes[i] & 1 for i in range(len(frame_bytes))]
	# Convert byte array back to string
	string = "".join(chr(int("".join(map(str, extracted[i:i + 8])), 2)) for i in
					 range(0, len(extracted), 8))
	# Cut off at the filler characters
	decoded = string.split("###")[0]

	# Print the extracted text
	# print("Sucessfully decoded: " + decoded)
	song.close()
	return decoded
	# with wave.open(filename, 'rb') as audio:
	# 	frames = bytearray(list(audio.readframes(audio.getnframes())))
	#
	# message_bits = [frames[i] & 1 for i in range(len(frames))]
	# message_bytes = [message_bits[i:i + 8] for i in
	# 				 range(0, len(message_bits), 8)]
	# message = ''.join(
	# 	chr(int(''.join(map(str, byte)), 2)) for byte in message_bytes)
	# return message


hidden_message = extract_lsb_enhanced('song_embedded.wav')
print("Hidden message:", hidden_message)
