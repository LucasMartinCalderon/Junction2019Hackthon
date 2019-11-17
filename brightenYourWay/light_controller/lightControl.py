import sys
import os
import datetime, time
import decimal
import serial
import serial.tools.list_ports

# Light level values in percentage (0 no light, 100 full brightness)
LIGHT_LEVEL_ARRAY = [0,   5,   10,  15,  20,  25,  30,  35,  40,  45,  50,  52,   55,  58,  60,  63,  65,  68,  70,  73,  75,  78,  80,  82,  85,  88,  90,  93,  95,  98,  100]
# Mapped values of brigthness in DALI (light control protocol) commands HEX values
DALI_LIGHT_LEVEL_HEX_ARRAY = ["00","90","AA","B9","C4","CB","D2","D8","DD","E1","E5","E6","E8","EA","EB","ED","EE","F0","F1","F3","F4","F5","F6","F7","F8","F9","FA","FB","FC","FD","FE"]

# Color temperature in Kelvin, 6500K is the coolest temperature, 2700K is the warmest
COLOUR_TEMPERATURE_ARRAY   =  [6500,   6400,  6300,   6200,  6100,  6000,  5900,  5800,  5700,   5600,  5500,   5400,  5300,  5200,  5100,   5000,  4900,   4800,  4700,   4600,  4500,   4400,  4300,   4200,  4100,   4000,  3900,   3800,  3700,   3600,  3500,   3400,  3300,   3200,  3100,    3000,  2900,   2800,  2700]
# Mapped values of color temperature to in HEX
COLOUR_TEMPERATURE_HEX_ARRAY = ["1964","1900", "189C","1838","17D4","1770","170c","16A8","1644","15E0","157C","1518","14B4","1450","13EC","1388","1324","12C0","125C","11F8","1194","1130",    "10CC","1068","1004","0FA0", "0F3C", "0ED8", "0E74", "0E10","0DAC","0D48", "0CE4","0C80","0C1C" ,"0BB8", "0B54","0AF0", "0A8C"]

# "00" - manual mode, you are in full controll of luminaire, PIR is off
# "01" - automatic , mode PIR sensor is in use, luminaire goes on when triggered and off after occupancy timeout
LUMIAIRE_MODE = "01"

def get_serial_port():
    ports = list(serial.tools.list_ports.comports())
    for p in ports:
        # This is for debugging Enable if you want to see what arte the devices connected
        print('device: ', p.device, 'manufacturer: ', p.manufacturer, 'description: ', p.description, p.hwid )
        if p.manufacturer and 'FTDI' in p.manufacturer:
            if p.description and ('USB Serial Port' in p.description or 'TTL232R-3V3' in p.description) :
                return p.device

        if p.manufacturer and 'FTDI' in p.manufacturer or 'TTL232R-3V3' in p.description:
            # Enable if you want to see debug msg if the device found
            # print( 'found it', p.manufacturer)
            return p.device
    return None

def init_serial_port(_port):
    if not _port:
        print('No port number supplied')
        return None
    else:
        try:
            serialDevice = serial.Serial(_port)
            serialDevice.baudrate = 115200
            serialDevice.bytesize=serial.EIGHTBITS
            serialDevice.parity=serial.PARITY_NONE
            serialDevice.stopbits=serial.STOPBITS_ONE
            serialDevice.timeout=0
            serialDevice.xonxoff = False
            serialDevice.rtscts=False
            serialDevice.dsrdtr=False
            return serialDevice
        except (ValueError,IOError,Exception) as ex:
            print("error init serial port: " + str(ex))
            return None
        
# no need to add \n as it will be added at the end of each message
def set_light_level_color_temperature( _serialDevice, _lightLevelValue =50, _colourTemperatureValue = 3900, _luminaire_id="2242"):
    if not _serialDevice.isOpen():
        try:
            # uncomment for debugging
            # print('Serial device is not open, trying to open it')
            _serialDevice.open()
        except (ValueError,IOError) as ex:
            # uncomment for debugging
            # print("error opening serial port: " + str(ex))
            return None

    if _serialDevice.isOpen():
        try:
            ser = _serialDevice
            lightValIndex = min(range(len(LIGHT_LEVEL_ARRAY)), key = lambda i: abs(LIGHT_LEVEL_ARRAY[i]-_lightLevelValue))
            colourTempValIndex = min(range(len(COLOUR_TEMPERATURE_ARRAY)), key = lambda i: abs(COLOUR_TEMPERATURE_ARRAY[i]-_colourTemperatureValue))
            serial_msg = '25' + str(_luminaire_id) + '0017' + str(DALI_LIGHT_LEVEL_HEX_ARRAY[lightValIndex]) + str(COLOUR_TEMPERATURE_HEX_ARRAY[colourTempValIndex]) + LUMIAIRE_MODE + 'FF\n'
            # uncomment for debugging
            print("writing " , str(serial_msg).encode() , " to " + str(_serialDevice.port))
            ser.write(str(serial_msg).encode())
            time.sleep(0.005)
        except (ValueError,IOError,Exception) as ex:
            # uncomment for debugging
            print("error in serial communication : " + str(ex))
            return None


        
def main():
    # Example Usage :
    Port_name = get_serial_port()
    # add other lights to this array
    LUMINAIRE_IDs = ["EC86","ECC5"] 
    length =  len(LUMINAIRE_IDs) 
    
    # port Exists so init it
    if Port_name:
        Serial_Device = init_serial_port(Port_name)
        if Serial_Device:
            for i in range(length): 
                set_light_level_color_temperature(Serial_Device, 50, 30000, LUMINAIRE_IDs[i])
                time.sleep(0.005)

          
    

if __name__ == '__main__':
	main() 