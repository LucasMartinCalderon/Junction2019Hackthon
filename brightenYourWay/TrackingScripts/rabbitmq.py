import pika
import atexit

class Subscriber(object):
    """RabbitMQ subscriber"""
    def __init__(self, broker_url):
        """Initialization"""
        self.topics = {}
        self.connection = pika.BlockingConnection(
            pika.ConnectionParameters(host=broker_url))
        self.channel = self.connection.channel()
        self.channel.basic_qos(prefetch_count=1)
        atexit.register(self.connection.close)
        self.callback = None

    def subscribe(self, topic, callback, only_latest=False):
        """Subscrive to given topic. The given callback function is called when a new message is available in the queue.
        The callback should have the following parameters: callback(ch, method, properties, body)."""
        if topic not in self.topics:
            self.topics[topic] = {}
            self.channel.exchange_declare(exchange=topic, exchange_type='fanout')
            if only_latest:
                arguments={'x-max-length' : 1, 'x-overflow' : 'drop-head'}
            else:
                arguments={}
            result = self.channel.queue_declare('',
                arguments=arguments,
                exclusive=True)
            queue_name = result.method.queue
            self.channel.queue_bind(
                exchange=topic, queue=queue_name)
            self.channel.basic_consume(
                queue=queue_name, 
                on_message_callback=self.basic_ack, 
                auto_ack=False)
            self.callback = callback

    def basic_ack(self, ch, method, properties, body):
        """Aknowledge the received message"""
        self.callback(ch, method, properties, body)
        self.channel.basic_ack(method.delivery_tag)
    
    def run(self):
        """Start consuming. This function blocks until CRTL+C is pressed."""
        try:
            self.channel.start_consuming()
        except KeyboardInterrupt:
            pass

    def stop(self):
        self.channel.close()