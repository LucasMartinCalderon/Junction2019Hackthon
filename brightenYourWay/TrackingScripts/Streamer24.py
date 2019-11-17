import numpy as np
import atexit
import sys
import time
from rabbitmq import Subscriber
import RadarRawInt.Sample as RadarRawIntSample


class Streamer24():
    def __init__(self,url='localhost',topic='radar24',only_latest=False):

        self.url = url
        self.topic = topic
        self.only_latest = only_latest

        # connect to RabbitMQ topic
        self.subscriber = Subscriber(self.url)
        self.subscriber.subscribe(self.topic, self.process_sample, only_latest=self.only_latest)
        atexit.register(self.exit)
        try:
            self.subscriber.run()
        except KeyboardInterrupt:
            pass
            
    def deserialize_radar_raw_int_data(self,sample):
        """Deserialize raw radar int data (Vtt24) to dictionary. 
        Return None is case of failure"""
        try:
            deserialized_sample = RadarRawIntSample.Sample.GetRootAsSample(sample, 0)
        except Exception:
            return None
        sample_dict = {}
        sample_dict['time'] = deserialized_sample.Time()
        sample_dict['seq'] = deserialized_sample.Seq()
        sample_dict['frame_id'] = deserialized_sample.FrameId()
        sample_dict['data'] = deserialized_sample.DataAsNumpy().reshape(
            deserialized_sample.Height(), deserialized_sample.Width())
        return sample_dict

    def process_sample(self, ch, method, properties, body):
        """Process a single sample from radar"""

        # data inside a dictionary
        # {'data':[1.3,4.4,5...]}
        sample_dict = self.deserialize_radar_raw_int_data(body)
        if body is None or sample_dict is None:
            print('Stream stopped.')
            return

        data = sample_dict['data']
        
        # your code here
        print("Variance: %.2f"%np.var(data))



    def exit(self):
        """Perform actions before exit"""
        print("Exiting..")

def main():
    """Start Streamer"""
    viewer = Streamer24()

if __name__ == '__main__':
    main()
