from flask import Flask, jsonify, request, abort, send_from_directory
from flask_cors import CORS
from flask_caching import Cache
import requests
import time
from threading import Thread
from dateutil.parser import parse
from datetime import datetime
import pytz
from pytz import timezone
from collections import defaultdict
from datetime import timedelta
from dateutil.relativedelta import relativedelta
import math
import logging
import sys
import termcolor
import os
from dotenv import load_dotenv
from time import sleep
import json

load_dotenv()  # take environment variables from .env.

app = Flask(__name__)
CORS(app)  # This will enable CORS for all routes

cache = Cache(app, config={'CACHE_TYPE': 'simple'})  # set up cache

logging.basicConfig(stream=sys.stdout, level=logging.INFO) # set up logging

merakiOrgId = os.getenv('MERAKI_ORG_ID')
merakiApiKey = os.getenv('MERAKI_API_KEY')

verkadaApiKey = os.getenv('VERKADA_API_KEY')
verkadaOrgId = os.getenv('VERKADA_ORG_ID')

EXPECTED_API_KEY = os.getenv('EXPECTED_API_KEY')

headers = {
    "Accept": "application/json",
    "X-Cisco-Meraki-API-Key": merakiApiKey,
}
verkada_url = "https://api.verkada.com/cameras/v1/devices"
verkada_headers = {
    "Accept": "application/json",
    "x-api-key": verkadaApiKey,
}

def save_to_fallback_file(data, filename):
    fallback_dir = "/app/fallbacks"  # Adjust the path as needed
    file_path = f"{fallback_dir}/{filename}.json"
    try:
        with open(file_path, 'w') as f:
            json.dump(data, f)
    except Exception as e:
        print(f"Failed to save fallback file: {e}")
        
def read_from_fallback_file(filename):
    fallback_dir = "/app/fallbacks"  # Adjust the path as needed
    file_path = f"{fallback_dir}/{filename}.json"
    try:
        with open(file_path, 'r') as f:
            return json.load(f)
    except Exception as e:
        print(f"Failed to read fallback file: {e}")
        return None

def fetch_and_cache_verkada():
    backoff_time = 1  # start with a 1-second backoff
    while True:
        try:
            query_params = {
                'org_id': verkadaOrgId,
                # optionally, specify page_size if you want more than 100 cameras
                # 'page_size': 200,
            }
            response = requests.get(verkada_url, headers=verkada_headers, params=query_params)

            # Only proceed if the response status code is 200
            if response.status_code == 200:
                # Handle successful response
                backoff_time = 1  # reset backoff time
                data = response.json()

                # Add productType key to each camera in the list
                for camera in data['cameras']:
                    camera['productType'] = 'camera'

                    # Reformat 'status' to match meraki syntax
                    camera['status'] = 'online' if camera['status'] == 'Live' else 'offline'

                cache.set('verkada_devices', data, timeout=300)
                save_to_fallback_file(data, 'verkada_devices_fallback')
            elif response.status_code == 429:
                # Handle rate limiting
                print("Rate limited, waiting for {} seconds".format(backoff_time))
                sleep(backoff_time)
                backoff_time *= 2  # double the backoff time for the next iteration
                continue
            else:
                print(f"Verkada API returned status code {response.status_code}")
        except Exception as e:
            print(f"Error while fetching Verkada data: {str(e)}")
            time.sleep(5)
            raise Exception(f"Error while Verkada data: {str(e)}")
            continue  # restart the loop if an error occurs
        finally:
            time.sleep(15)

def fetch_and_cache_top_clients():
    backoff_time = 1  # start with a 1-second backoff
    while True:
        try:
            top_clients_url = f"https://api.meraki.com/api/v1/organizations/{merakiOrgId}/summary/top/clients/byUsage"
            params = {'timespan': 86400*7}
            response = requests.get(top_clients_url, headers=headers, params=params)
            if response.status_code == 200:
                # Handle successful response
                backoff_time = 1  # reset backoff time
                data = response.json()
                cache.set('top_clients', data, timeout=300)
                save_to_fallback_file(data, 'top_clients_fallback')
            elif response.status_code == 429:
                # Handle rate limiting
                print("Rate limited, waiting for {} seconds".format(backoff_time))
                sleep(backoff_time)
                backoff_time *= 2  # double the backoff time for the next iteration
                continue
            else:
                print(f"Request to get top clients by usage failed with status code {response.status_code}")
        except Exception as e:
            print(f"Error while fetching Meraki Top Clients data: {str(e)}")
            time.sleep(5)
            raise Exception(f"Error while Meraki Top Clients data: {str(e)}")
            continue  # restart the loop if an error occurs
        finally:
            time.sleep(15)

def fetch_and_cache_top_manufacturers():
    backoff_time = 1  # start with a 1-second backoff
    while True:
        try:
            top_manufacturers_url = f"https://api.meraki.com/api/v1/organizations/{merakiOrgId}/summary/top/clients/manufacturers/byUsage"
            params = {'timespan': 86400*7}
            response = requests.get(top_manufacturers_url, headers=headers, params=params)
            if response.status_code == 200:
                # Handle successful response
                backoff_time = 1  # reset backoff time
                data = response.json()
                cache.set('top_manufacturers', data, timeout=300)
                save_to_fallback_file(data, 'top_manufacturers_fallback')
            elif response.status_code == 429:
                # Handle rate limiting
                print("Rate limited, waiting for {} seconds".format(backoff_time))
                sleep(backoff_time)
                backoff_time *= 2  # double the backoff time for the next iteration
                continue
            else:
                print(f"Request to get top manufacturers failed with status code {response.status_code}")
        except Exception as e:
            print(f"Error while fetching Meraki Top Manufacturers data: {str(e)}")
            time.sleep(5)
            raise Exception(f"Error while Meraki Top Manufacturers data: {str(e)}")
            continue  # restart the loop if an error occurs
        finally:
            time.sleep(15)

def fetch_and_cache_top_devices():
    backoff_time = 1  # start with a 1-second backoff
    while True:
        try:
            top_devices_url = f"https://api.meraki.com/api/v1/organizations/{merakiOrgId}/summary/top/devices/byUsage"
            params = {'timespan': 86400*7}
            response = requests.get(top_devices_url, headers=headers, params=params)
            if response.status_code == 200:
                # Handle successful response
                backoff_time = 1  # reset backoff time
                data = response.json()
                cache.set('top_devices', data, timeout=300)
                save_to_fallback_file(data, 'top_devices_fallback')
            elif response.status_code == 429:
                # Handle rate limiting
                print("Rate limited, waiting for {} seconds".format(backoff_time))
                sleep(backoff_time)
                backoff_time *= 2  # double the backoff time for the next iteration
                continue
            else:
                print(f"Request to get top devices failed with status code {response.status_code}")
        except Exception as e:
            print(f"Error while fetching Meraki Top Devices data: {str(e)}")
            time.sleep(5)
            raise Exception(f"Error while Meraki Top Devices data: {str(e)}")
            continue  # restart the loop if an error occurs
        finally:
            time.sleep(15)

def fetch_and_cache_meraki_status():
    backoff_time = 1  # start with a 1-second backoff
    while True:
        try:
            merakiStatusUrl = f"https://api.meraki.com/api/v1/organizations/{merakiOrgId}/devices/statuses"
            response = requests.get(merakiStatusUrl, headers=headers)
            if response.status_code == 200:
                # Handle successful response
                backoff_time = 1  # reset backoff time
                data = response.json()
                cache.set('devices_availabilities', data, timeout=300)
                save_to_fallback_file(data, 'devices_availabilities_fallback')
            elif response.status_code == 429:
                # Handle rate limiting
                print("Rate limited, waiting for {} seconds".format(backoff_time))
                sleep(backoff_time)
                backoff_time *= 2  # double the backoff time for the next iteration
                continue
            else:
                print(f"Meraki Status Request failed with status code {response.status_code}")
                cache.set('devices_availabilities', None, timeout=300)  # set to None in case of error
        except Exception as e:
            print(f"Error while fetching Meraki Status data: {str(e)}")
            time.sleep(5)
            raise Exception(f"Error while Meraki Status data: {str(e)}")
            continue  # restart the loop if an error occurs
        finally:
            time.sleep(15)

def fetch_and_cache_bandwidth():
    backoff_time = 1  # start with a 1-second backoff
    bandwidth_url = f"https://api.meraki.com/api/v1/organizations/{merakiOrgId}/clients/bandwidthUsageHistory?timespan=604800"
    while True:
        try:
            response = requests.request('GET', bandwidth_url, headers=headers)

            if response.status_code == 200:
                # Handle successful response
                backoff_time = 1  # reset backoff time
                data = response.json()
                total_mbs = 0
                upstream_mbps = defaultdict(list)
                downstream_mbps = defaultdict(list)
                timestamps = defaultdict(list)

                for i in range(len(data) - 1):
                    ts1 = data[i]['ts']
                    ts2 = data[i + 1]['ts']

                    time_diff = (parse(ts2) - parse(ts1)).total_seconds()
                    mbs = (data[i]['total'] * time_diff) / 8
                    total_mbs += mbs
                    hour_ts = parse(ts1).replace(minute=0, second=0, microsecond=0)

                    hour_ts_str = hour_ts.strftime("%Y-%m-%dT%H:%M:%S")

                    # If upstream and downstream values are not zero, add them to the relevant lists
                    if data[i]['upstream'] != 0 and data[i]['downstream'] != 0:
                        upstream_mbps[hour_ts_str].append(data[i]['upstream'])
                        downstream_mbps[hour_ts_str].append(data[i]['downstream'])
                        timestamps[hour_ts_str].append(parse(ts1))

                # Now average the data and prepare for caching
                average_upstream_mbps = {k: sum(v) / len(v) for k, v in upstream_mbps.items()}
                average_downstream_mbps = {k: sum(v) / len(v) for k, v in downstream_mbps.items()}
                average_timestamp = {k: (datetime.strptime(k, "%Y-%m-%dT%H:%M:%S") + timedelta(minutes=sum((ts.minute for ts in v)) / len(v))).strftime("%Y-%m-%dT%H:%M:%S") for k, v in timestamps.items()}

                # Now average the data and prepare for caching
                bandwidth_data = {
                    'total_mbs': total_mbs,
                    'upstream_mbps': average_upstream_mbps,
                    'downstream_mbps': average_downstream_mbps,
                    'timestamp': average_timestamp
                }
                
                cache.set('bandwidth_data', bandwidth_data, timeout=300)
                save_to_fallback_file(bandwidth_data, 'bandwidth_data_fallback')
                
            elif response.status_code == 429:
                # Handle rate limiting
                print("Rate limited, waiting for {} seconds".format(backoff_time))
                sleep(backoff_time)
                backoff_time *= 2  # double the backoff time for the next iteration
                continue
            else:
                print(f"Meraki Bandwidth Request failed with status code {response.status_code}")
                raise Exception(f"Error while Meraki Bandwidth data: {str(e)}")
        
        except Exception as e:
            print(f"Error while fetching Meraki Bandwidth data: {str(e)}")
            time.sleep(5)
            raise Exception(f"Error while Meraki Bandwidth data: {str(e)}")
            continue  # restart the loop if an error occurs
        finally:
            time.sleep(15)

def fetch_and_cache_top_models():
    backoff_time = 1  # start with a 1-second backoff
    while True:
        try:
            top_models_url = f"https://api.meraki.com/api/v1/organizations/{merakiOrgId}/summary/top/devices/models/byUsage"
            params = {'timespan': 86400*7}  # you can adjust this timespan as needed
            response = requests.get(top_models_url, headers=headers, params=params)
            if response.status_code == 200:
                # Handle successful response
                backoff_time = 1  # reset backoff time
                data = response.json()
                cache.set('top_models', data, timeout=300)
                save_to_fallback_file(data, 'top_models_fallback')
            elif response.status_code == 429:
                # Handle rate limiting
                print("Rate limited, waiting for {} seconds".format(backoff_time))
                sleep(backoff_time)
                backoff_time *= 2  # double the backoff time for the next iteration
                continue
            else:
                print(f"Request to get top device models failed with status code {response.status_code}")
        except Exception as e:
            print(f"Error while fetching Meraki Top Models data: {str(e)}")
            time.sleep(5)
            raise Exception(f"Error while fetching Meraki Top Models data: {str(e)}")
            continue  # restart the loop if an error occurs
        finally:
            time.sleep(15)

def fetch_and_cache_verkada_occupancy():
    backoff_time = 1  # start with a 1-second backoff
    while True:
        try:
            # Fetch the data from cache
            data = cache.get('verkada_devices')

            # Filter cameras with model "CD62"
            cameras = [camera for camera in data['cameras'] if camera['model'] == 'CD62']

            # Calculate the epoch time for one week ago
            one_week_ago = datetime.now(pytz.timezone('CST6CDT')) - timedelta(weeks=1)
            start_time = int(time.mktime(one_week_ago.timetuple()))

            # Define the endpoint for getting occupancy data
            url_trends = "https://api.verkada.com/cameras/v1/analytics/occupancy_trends"

            # API request parameters for getting occupancy data
            params_trends = {
                "org_id": verkadaOrgId,
                "start_time": start_time,
                "interval": "15_minutes",  # Change the interval to 15 minutes
            }

            # For each camera, get the occupancy data
            for camera in cameras:
                params_trends["camera_id"] = camera['camera_id']
                response_trends = requests.get(url_trends, params=params_trends, headers=verkada_headers)

                if response_trends.status_code == 200:
                    # Handle successful response
                    backoff_time = 1  # reset backoff time
                    occupancy_data = response_trends.json()
                    trend_in = occupancy_data['trend_in']

                    # Separate timestamps and occupancy counts
                    timestamps = [datetime.fromtimestamp(entry[0], tz=pytz.timezone('CST6CDT')) for entry in trend_in]
                    occupancy_counts = [entry[2] for entry in trend_in]

                    # Accumulate the data into daily bins
                    daily_occupancy_counts = {}
                    for timestamp, count in zip(timestamps, occupancy_counts):
                        date = timestamp.date()  # Get the date part of the timestamp
                        if date not in daily_occupancy_counts:
                            daily_occupancy_counts[date] = 0
                        daily_occupancy_counts[date] += count

                    # Save the occupancy data to the camera data
                    camera['occupancy_data'] = {
                        'timestamps': [timestamp.isoformat() for timestamp in daily_occupancy_counts.keys()],
                        'occupancy_counts': list(daily_occupancy_counts.values()),
                    }
                elif response_trends.status_code == 429:
                    # Handle rate limiting
                    print(f"Rate limited on camera {camera['camera_id']}, waiting for {backoff_time} seconds")
                    sleep(backoff_time)
                    backoff_time *= 2  # double the backoff time for the next iteration
                    continue
                else:
                    error_message = f"Request failed for camera {camera['camera_id']} with status code {response_trends.status_code}. Response text: {response_trends.text}"
                    print(error_message)
                    time.sleep(5)
                    raise Exception(error_message)

            # Cache the cameras data
            cache.set('verkada_occupancy', cameras, timeout=300)
            save_to_fallback_file(cameras, 'verkada_occupancy_fallback')
        except Exception as e:
            # print(f"Error while fetching Verkada data: {str(e)}")
            time.sleep(5)
            raise Exception(f"Error while fetching Verkada Occupancy data: {str(e)}")
            continue  # restart the loop if an error occurs
        finally:
            time.sleep(30)

def get_default_data():
    return {'sent': 0, 'recv': 0, 'activeTime': 0, 'flows': 0, 'numClients': 0}

def fetch_and_cache_traffic_analysis():
    backoff_time_networks = 1  # Backoff time for networks request
    backoff_time_traffic = 1  # Backoff time for traffic request

    while True:
        try:
            # Initialize an empty dictionary to store grouped data
            grouped_data = defaultdict(get_default_data)

            # Get the list of networks with rate-limiting handling
            while True:
                networks_url = f"https://api.meraki.com/api/v1/organizations/{merakiOrgId}/networks"
                response_networks = requests.get(networks_url, headers=headers)

                if response_networks.status_code == 200:
                    networks_data = response_networks.json()
                    backoff_time_networks = 1  # Reset backoff time
                    break
                elif response_networks.status_code == 429:
                    print(f"Rate limited on networks request, waiting for {backoff_time_networks} seconds")
                    sleep(backoff_time_networks)
                    backoff_time_networks *= 2
                    continue
                else:
                    print(f"Networks API returned status code {response_networks.status_code}")
                    # Handle other errors as needed
                    sleep(5)
                    continue

            network_ids = [network['id'] for network in networks_data]

            # Fetch and process the traffic data for each network
            for network_id in network_ids:
                # The URL for fetching traffic analysis data
                traffic_url = f"https://api.meraki.com/api/v1/networks/{network_id}/traffic"

                # The parameters for the API request
                params = {'timespan': 604800}  # 7 days in seconds

                # Make the API request with rate-limiting handling
                while True:
                    response_traffic = requests.get(traffic_url, headers=headers, params=params)

                    if response_traffic.status_code == 200:
                        traffic_data = response_traffic.json()
                        backoff_time_traffic = 1  # Reset backoff time
                        break
                    elif response_traffic.status_code == 429:
                        print(f"Rate limited on traffic request for network {network_id}, waiting for {backoff_time_traffic} seconds")
                        sleep(backoff_time_traffic)
                        backoff_time_traffic *= 2
                        continue
                    else:
                        print(f"Traffic API returned status code {response_traffic.status_code}")
                        # Handle other errors as needed
                        sleep(5)
                        continue

                # Group the data by application
                for entry in traffic_data:
                    app = entry['application']
                    grouped_data[app]['sent'] += entry['sent']
                    grouped_data[app]['recv'] += entry['recv']
                    grouped_data[app]['activeTime'] += entry['activeTime']
                    grouped_data[app]['flows'] += entry['flows']
                    grouped_data[app]['numClients'] += entry.get('numClients', 0)

            # Cache the grouped data
            cache.set('traffic_analysis_data', grouped_data, timeout=300)
            save_to_fallback_file(grouped_data, 'traffic_analysis_fallback')

        except Exception as e:
            print(f"Error while fetching Meraki Traffic Analysis data: {str(e)}")
            raise Exception(f"Error while fetching Meraki Traffic Analysis data: {str(e)}")
        finally:
            sleep(15)


class FetchThread(Thread):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.error_count = 0

    def run(self):
        while True:
            try:
                self._target()  # Execute the target function
            except Exception as e:
                self.error_count += 1
                print(f"Error in {self.name}: {str(e)}")
            finally:
                time.sleep(5)  # Sleep for 5 seconds before the next loop iteration

def monitor_threads(threads):
    while True:
        for t in threads:
            # print(f"Checking on {t.name}...")
            if t.error_count > 0:  # if the thread has encountered an error
                print(f"\n{t.name} has encountered {t.error_count} error(s) in the past minute. Restarting...\n")
                new_thread = FetchThread(target=t._target)  # create a new thread
                new_thread.name = t.name
                new_thread.start()  # start the new thread
                threads.remove(t)  # remove the old thread from the list
                threads.append(new_thread)  # add the new thread to the list
                t.error_count = 0  # Reset the error count of the old thread
        time.sleep(60)  # check every minute

# Start your threads
threads = [
    FetchThread(target=fetch_and_cache_top_clients, name='top_clients_thread'),
    FetchThread(target=fetch_and_cache_meraki_status, name='background_thread'),
    FetchThread(target=fetch_and_cache_bandwidth, name='bancdwidth_thread'),
    FetchThread(target=fetch_and_cache_verkada, name='verkada_thread'),
    FetchThread(target=fetch_and_cache_top_models, name='top_models_thread'),
    FetchThread(target=fetch_and_cache_top_manufacturers, name='top_manufacturers_thread'),
    FetchThread(target=fetch_and_cache_top_devices, name='top_devices_thread'),
    FetchThread(target=fetch_and_cache_verkada_occupancy, name='verkada_occupancy_thread'),
    FetchThread(target=fetch_and_cache_traffic_analysis, name='traffic_analysis_thread'),
    # Add all your other threads...
]

for t in threads:
    t.start()

# Start a thread to monitor the status of your threads
monitor_thread = Thread(target=monitor_threads, args=(threads,))
monitor_thread.name = 'monitor_thread'
monitor_thread.start()


# Define routes
@app.route('/top_manufacturers')
def get_top_manufacturers():
    api_key = request.headers.get('Api-Key')
    data = cache.get('top_manufacturers') or read_from_fallback_file('top_manufacturers_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch Meraki Manufacturers data from cache'}), 500
    return jsonify(data)

@app.route('/traffic_analysis')
def get_traffic_analysis():
    api_key = request.headers.get('Api-Key')
    data = cache.get('traffic_analysis_data') or read_from_fallback_file('traffic_analysis_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch traffic analysis data from cache'}), 500
    return jsonify(data)


@app.route('/bandwidth')
def get_bandwidth():
    api_key = request.headers.get('Api-Key')
    data = cache.get('bandwidth_data') or read_from_fallback_file('bandwidth_data_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch Meraki Bandwidth data from cache'}), 500
    return jsonify(data)

@app.route('/verkada_occupancy')
def get_verkada_occupancy():
    api_key = request.headers.get('Api-Key')
    data = cache.get('verkada_occupancy') or read_from_fallback_file('verkada_occupancy_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch Verkada occupancy data from cache'}), 500
    if not api_key or api_key != EXPECTED_API_KEY:
        for camera in data:
            camera['camera_id'] = 'N/A'
            camera['local_ip'] = 'N/A'
            camera['location'] = 'N/A'
            camera['location_lat'] = 'N/A'
            camera['location_lon'] = 'N/A'
            # camera['occupancy_data'] = 'N/A'
            camera['mac'] = 'N/A'
            camera['serial'] = 'N/A'

    return jsonify(data)

@app.route('/top_clients')
def get_top_clients():
    api_key = request.headers.get('Api-Key')
    data = cache.get('top_clients') or read_from_fallback_file('top_clients_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch Meraki Top Clients data from cache'}), 500
    if not api_key or api_key != EXPECTED_API_KEY:
        for client in data:
            client['id'] = 'N/A'
            client['mac'] = 'N/A'
            client['network']['id'] = 'N/A'
    return jsonify(data)

@app.route('/top_devices')
def get_top_devices():
    api_key = request.headers.get('Api-Key')
    data = cache.get('top_devices') or read_from_fallback_file('top_devices_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch Meraki Top Devices data from cache'}), 500
    if not api_key or api_key != EXPECTED_API_KEY:
        for device in data:
            device['mac'] = 'N/A'
            device['network']['id'] = 'N/A'
            device['serial'] = 'N/A'
    return jsonify(data)

@app.route('/top_models')
def get_top_models():
    api_key = request.headers.get('Api-Key')
    data = cache.get('top_models') or read_from_fallback_file('top_models_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch Meraki Top Models data from cache'}), 500
    if not api_key or api_key != EXPECTED_API_KEY:
        for device in data:
            device['count'] = 'N/A'
    return jsonify(data)

@app.route('/verkada_devices')
def get_verkada_devices():
    api_key = request.headers.get('Api-Key')
    data = cache.get('verkada_devices') or read_from_fallback_file('verkada_devices_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch Verkada Devices data from cache'}), 500
    if not api_key or api_key != EXPECTED_API_KEY:
        for camera in data['cameras']:
            camera['camera_id'] = 'N/A'
            camera['local_ip'] = 'N/A'
            camera['location'] = 'N/A'
            camera['location_lat'] = 'N/A'
            camera['location_lon'] = 'N/A'
            camera['firmware'] = 'N/A'
            camera['mac'] = 'N/A'
            camera['serial'] = 'N/A'
    now = datetime.now(timezone('UTC'))  # adjust to the correct timezone
    for camera in data['cameras']:
        last_online_timestamp = camera['last_online']
        camera['lastSeen'] = last_online_timestamp


    return jsonify(data)

@app.route('/meraki_status')
def get_meraki_status():
    api_key = request.headers.get('Api-Key')
    data = cache.get('devices_availabilities') or read_from_fallback_file('devices_availabilities_fallback')
    if data is None:
        return jsonify({'error': 'Failed to fetch Meraki status data from cache'}), 500
    if not api_key or api_key != EXPECTED_API_KEY:
        # Redact sensitive info if API key is incorrect
        for device in data:
            device['mac'] = 'N/A'
            device['serial'] = 'N/A'
            device['gateway'] = 'N/A'
            device['primaryDns'] = 'N/A'
            device['publicIp'] = 'N/A'
            device['lanIp'] = 'N/A'
            device['secondaryDns'] = 'N/A'
            if 'network' in device and 'id' in device['network']:
                device['network']['id'] = 'N/A'

    # Convert 'lastReportedAt' to a Unix timestamp and assign it to 'lastSeen'
    for device in data:
        if 'lastReportedAt' in device and device['lastReportedAt'] is not None:
            last_reported_at = parse(device['lastReportedAt']).astimezone(pytz.UTC)
            device['lastSeen'] = last_reported_at.timestamp()


    # Separate dormant and non-dormant devices
    dormant_devices = [device for device in data if device.get('status') == 'dormant']
    other_devices = [device for device in data if device.get('status') != 'dormant']

    # Sort only the dormant devices
    dormant_devices.sort(key=lambda device: (device.get('lastSeen') is None, device.get('lastSeen') or ""))

    # Concatenate sorted dormant devices and non-dormant devices
    data = other_devices + dormant_devices
             
    return jsonify(data), 200

@app.route('/')
def serve_funny_image():
    print(merakiOrgId)
    print(merakiApiKey)
    print(verkadaApiKey)
    print(verkadaOrgId)
    return send_from_directory('static', 'stare-linkstare.gif')

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000)
