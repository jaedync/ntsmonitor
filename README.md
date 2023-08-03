
# LETU Network Services Status Monitor

This is a status monitoring application built using Meraki API, Flask for the backend, and React for the frontend. The application is designed to provide real-time status updates for Letourneau's cloud managed devices, which is especially useful in a network monitoring context. 

## Features

- Real-time status monitoring: The application updates the status of Meraki devices twice a minute, providing a near-real-time view of the network status.
- Prioritization of offline devices: Offline devices are listed at the top for easy and quick identification.
- Bandwidth Monitoring: The application provides total bandwidth usage statistics and a detailed usage chart.
- Device and Manufacturer Analysis: The application provides information about top device models, top manufacturers, and top devices based on usage.
- Traffic Analysis: The application provides detailed traffic analysis data.
- Occupancy Monitoring: For Verkada cameras, the application provides detailed occupancy data.
- Integration with Verkada Security: The application also monitors the status of Verkada security devices.

## Environment Variables

To run this project, you will need to add the following environment variables:

- `MERAKI_ORG_ID`
- `MERAKI_API_KEY`
- `VERKADA_API_KEY`
- `VERKADA_ORG_ID`
- `EXPECTED_API_KEY`

## Run Locally

1. Clone the project
2. Install dependencies
   ```
   pip install -r requirements.txt
   ```
   ```
   cd client && npm install
   ```
3. Start the server
   ```
   python server.py
   ```
4. Start the client
   ```
   cd client && npm start
   ```

## Tech Stack

- **Client:** React
- **Server:** Flask, Python
- **External APIs:** Meraki, Verkada

## API Reference

- `/top_manufacturers`: GET top manufacturers by usage
- `/traffic_analysis`: GET traffic analysis data
- `/bandwidth`: GET bandwidth usage data
- `/verkada_occupancy`: GET Verkada occupancy data
- `/top_clients`: GET top clients by usage
- `/top_devices`: GET top devices by usage
- `/top_models`: GET top device models by usage
- `/verkada_devices`: GET Verkada device status data
- `/meraki_status`: GET Meraki device status data

## Demo

You can view a live demo of the application [here](https://nts.jaedynchilton.com). Please note that the demo site may not always be live.

## Authors

- [@jaedynchilton](mailto:mail@jaedynchilton.com)

## License

[MIT](https://choosealicense.com/licenses/mit/)

## Acknowledgements

- [Meraki API](https://developer.cisco.com/meraki/)
- [Verkada API](https://apidocs.verkada.com/)
- [OpenAI's GPT-4](https://github.com/openai/gpt-4)
