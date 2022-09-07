'use strict';

const binutils = require('binutils64');
const Codec = require('./codec');

/**
 * Codec 8 decoding
 */
class Codec8e extends Codec {
  /**
   * Trip event id's
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_ID() {
    return 250;
  }

  /**
   * Trip start flag
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_START() {
    return 1;
  }

  /**
   * Trip end flag
   *
   * @returns {number}
   * @constructor
   */
  static get TRIP_EVENT_END() {
    return 0;
  }

  /**
   * Odometer property id
   *
   * @returns {number}
   * @constructor
   */
  static get ODOMETER_PROPERTY_ID() {
    return 16;
  }

  /**
   * Codec 8 construct
   *
   * @param reader
   * @param number_of_records
   */
  constructor(reader, number_of_records) {
    super(reader, number_of_records);
    this._gpsPrecision = 10000000;
  }

  /**
   * Parsing AVL record header
   */
  parseHeader() {
    this.avlObj.records = [];

    for (var i = 0; i < this.number_of_records; i++) {
      this.parseAvlRecords();
    }
  }

  /**
   * Parse single AVL record
   */
  parseAvlRecords() {
    let avlRecord = {
      timestamp: new Date(this.toInt(this.reader.ReadBytes(8))),
      priority: this.toInt(this.reader.ReadBytes(1)),
      gps: {
        longitude: this.reader.ReadInt32(),
        latitude: this.reader.ReadInt32(),
        altitude: this.reader.ReadInt16(),
        angle: this.reader.ReadInt16(),
        satellites: this.reader.ReadInt8(),
        speed: this.reader.ReadInt16(),
      },
      event_id: this.toInt(this.reader.ReadBytes(2)),
      properties_count: this.toInt(this.reader.ReadBytes(2)),
      ioElements: [],
    };

    if ('0' == avlRecord.gps.longitude.toString(2).substr(0, 1)) {
      avlRecord.gps.longitude *= -1;
    }
    avlRecord.gps.longitude /= this._gpsPrecision;

    if ('0' == avlRecord.gps.latitude.toString(2).substr(0, 1)) {
      avlRecord.gps.latitude *= -1;
    }
    avlRecord.gps.latitude /= this._gpsPrecision;

    avlRecord.ioElements = this.parseIoElements();

    this.avlObj.records.push(avlRecord);
  }

  /**
   * Parse single IoElement records
   *
   * @returns {Array}
   */
  parseIoElements() {
    let ioElement = [];

    /**
     * Read 1 byte ioProperties
     */
    let ioCountInt8 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt8; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.toInt(this.reader.ReadBytes(1));

      // let elToPush = {
      //     id        : property_id,
      //     value     : value
      // };
      // if(this.ioElements()[property_id]){
      //     elToPush.label = this.ioElements()[property_id].label;
      //     elToPush.dimension = this.ioElements()[property_id].dimension;
      //     if(this.ioElements()[property_id].values[value]){
      //         elToPush.valueHuman: this.ioElements()[property_id].values[value];
      //     }
      // }

      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    /**
     * Read 2 byte ioProperties
     */
    let ioCountInt16 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt16; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadInt16();

      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    /**
     * Read 4 byte ioProperties
     */
    let ioCountInt32 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt32; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadInt32();

      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    /**
     * Read 8 byte ioProperties
     */
    let ioCountInt64 = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountInt64; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let value = this.reader.ReadDouble();
      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    /**
     * Read n byte ioProperties
     */

    let ioCountIntX = this.toInt(this.reader.ReadBytes(2));

    for (var i = 0; i < ioCountIntX; i++) {
      let property_id = this.toInt(this.reader.ReadBytes(2));
      let ioValueLength = this.toInt(this.reader.ReadBytes(2));
      let valueRaw = this.reader.ReadBytes(ioValueLength);
      let value = valueRaw.toString('hex');
      ioElement.push({
        id: property_id,
        value: value,
        label: this.ioElements()[property_id]
          ? this.ioElements()[property_id].label
          : '',
        dimension: this.ioElements()[property_id]
          ? this.ioElements()[property_id].dimension
          : '',
        valueHuman: this.ioElements()[property_id]
          ? this.ioElements()[property_id].values
            ? this.ioElements()[property_id].values[value]
            : ''
          : '',
      });
    }

    return ioElement;
  }

  /**
   *  Codec 8 IoElements
   * @returns {{"1": {label: string, values: {"0": string, "1": string}}, "10": {label: string, values: {"0": string, "1": string}}, "11": {label: string}, "12": {label: string}, "13": {label: string, dimension: string}, "14": {label: string}, "15": {label: string}, "16": {label: string}, "17": {label: string}, "18": {label: string}, "19": {label: string}, "20": {label: string, dimension: string}, "21": {label: string, values: {"1": string, "2": string, "3": string, "4": string, "5": string}}, "22": {label: string, dimension: string}, "23": {label: string, dimension: string}, "24": {label: string, dimension: string}, "25": {label: string, dimension: string}, "26": {label: string, dimension: string}, "27": {label: string, dimension: string}, "28": {label: string, dimension: string}, "29": {label: string, dimension: string}, "30": {label: string}, "31": {label: string, dimension: string}, "32": {label: string, dimension: string}, "33": {label: string, dimension: string}, "34": {label: string, dimension: string}, "35": {label: string, dimension: string}, "36": {label: string, dimension: string}, "37": {label: string, dimension: string}, "38": {label: string, dimension: string}, "39": {label: string, dimension: string}, "40": {label: string, dimension: string}, "41": {label: string, dimension: string}, "42": {label: string, dimension: string}, "43": {label: string, dimension: string}, "44": {label: string, dimension: string}, "45": {label: string, dimension: string}, "46": {label: string, dimension: string}, "47": {label: string, dimension: string}, "48": {label: string, dimension: string}, "49": {label: string, dimension: string}, "50": {label: string, dimension: string}, "51": {label: string, dimension: string}, "52": {label: string, dimension: string}, "53": {label: string, dimension: string}, "54": {label: string, dimension: string}, "55": {label: string, dimension: string}, "56": {label: string, dimension: string}, "57": {label: string, dimension: string}, "58": {label: string, dimension: string}, "59": {label: string, dimension: string}, "60": {label: string, dimension: string}, "66": {label: string, dimension: string}, "67": {label: string, dimension: string}, "68": {label: string, dimension: string}, "69": {label: string, values: {"0": string, "1": string, "2": string, "3": string}}, "80": {label: string, values: {"0": string, "1": string, "2": string, "3": string, "4": string, "5": string}}, "86": {label: string, dimension: string}, "104": {label: string, dimension: string}, "106": {label: string, dimension: string}, "108": {label: string, dimension: string}, "181": {label: string}, "182": {label: string}, "199": {label: string}, "200": {label: string, values: {"0": string, "1": string, "2": string}}, "205": {label: string}, "206": {label: string}, "238": {label: string}, "239": {label: string, values: {"0": string, "1": string}}, "240": {label: string, values: {"0": string, "1": string}}, "241": {label: string}, "256": {label: string}}}
   */
  ioElements() {
    return {"1":{"label":"Din 1","values":{"0":"0","1":"1"}},"2":{"label":"Digital Input 2"},"3":{"label":"Digital Input 3"},"4":{"label":"Pulse Counter Din1"},"5":{"label":"Pulse Counter Din2"},"6":{"label":"Analog Input 2"},"8":{"label":"Authorized iButton"},"9":{"label":"Analog Input 1"},"10":{"label":"SD Status","values":{"0":"Not present","1":"Present"}},"11":{"label":"SIM ICCID1 number"},"12":{"label":"Fuel Used GPS"},"13":{"label":"Average Fuel Use","dimension":"L / 100 km"},"14":{"label":"SIM ICCID2 number"},"15":{"label":"Eco Score"},"16":{"label":"Total Odometer"},"17":{"label":"Accelerometer X axis"},"18":{"label":"Accelerometer Y axis"},"19":{"label":"Accelerometer Z axis"},"20":{"label":"BLE 2 Battery Voltage","dimension":"%"},"21":{"label":"GSM Signal Strength","values":{"1":"1","2":"2","3":"3","4":"4","5":"5"}},"22":{"label":"BLE 3 Battery Voltage","dimension":"%"},"23":{"label":"BLE 4 Battery Voltage","dimension":"%"},"24":{"label":"Speed","dimension":"km/h"},"25":{"label":"BLE 1 Temperature","dimension":"C"},"26":{"label":"BLE 2 Temperature","dimension":"C"},"27":{"label":"BLE 3 Temperature","dimension":"C"},"28":{"label":"BLE 4 Temperature","dimension":"C"},"29":{"label":"BLE 1 Battery Voltage","dimension":"%"},"30":{"label":"Number of DTC"},"31":{"label":"Calculated engine load value","dimension":"%"},"32":{"label":"Engine coolant temperature","dimension":"C"},"33":{"label":"Short term fuel trim 1","dimension":"%"},"34":{"label":"Fuel pressure","dimension":"kPa"},"35":{"label":"Intake manifold absolute pressure","dimension":"kPa"},"36":{"label":"Engine RPM","dimension":"rpm"},"37":{"label":"Vehicle speed","dimension":"km/h"},"38":{"label":"Timing advance","dimension":"O"},"39":{"label":"Intake air temperature","dimension":"C"},"40":{"label":"MAF air flow rate","dimension":"g/sec, *0.01"},"41":{"label":"Throttle position","dimension":"%"},"42":{"label":"Run time since engine start","dimension":"s"},"43":{"label":"Distance traveled MIL on","dimension":"Km"},"44":{"label":"Relative fuel rail pressure","dimension":"kPa*0.1"},"45":{"label":"Direct fuel rail pressure","dimension":"kPa*0.1"},"46":{"label":"Commanded EGR","dimension":"%"},"47":{"label":"EGR error","dimension":"%"},"48":{"label":"Fuel level","dimension":"%"},"49":{"label":"Distance traveled since codes cleared","dimension":"Km"},"50":{"label":"Barometric pressure","dimension":"kPa"},"51":{"label":"Control module voltage","dimension":"mV"},"52":{"label":"Absolute load value","dimension":"%"},"53":{"label":"Ambient air temperature","dimension":"C"},"54":{"label":"Time run with MIL on","dimension":"min"},"55":{"label":"Time since trouble codes cleared","dimension":"min"},"56":{"label":"Absolute fuel rail pressure","dimension":"kPa*10"},"57":{"label":"Hybrid battery pack remaining life","dimension":"%"},"58":{"label":"Engine oil temperature","dimension":"C"},"59":{"label":"Fuel injection timing","dimension":"O, *0.01"},"60":{"label":"Engine fuel rate","dimension":"L/h, *100"},"61":{"label":"Geofence zone 06","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"62":{"label":"Geofence zone 07","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"63":{"label":"Geofence zone 08","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"64":{"label":"Geofence zone 09","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"65":{"label":"Geofence zone 10","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"66":{"label":"Ext Voltage","dimension":"mV"},"67":{"label":"Battery Voltage","dimension":"mV"},"68":{"label":"Battery Current","dimension":"mA"},"69":{"label":"GNSS Status","values":{"0":"OFF","1":"ON with fix","2":"ON without fix","3":"In sleep state"}},"70":{"label":"Geofence zone 11","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"71":{"label":"Dallas Temperature ID 4"},"72":{"label":"Dallas Temperature 1"},"73":{"label":"Dallas Temperature 2"},"74":{"label":"Dallas Temperature 3"},"75":{"label":"Dallas Temperature 4"},"76":{"label":"Dallas Temperature ID 1"},"77":{"label":"Dallas Temperature ID 2"},"78":{"label":"iButton"},"79":{"label":"Dallas Temperature ID 3"},"80":{"label":"Data Mode","values":{"0":"Home On Stop","1":"Home On Moving","2":"Roaming On Stop","3":"Roaming On Moving","4":"Unknown On Stop","5":"Unknown On Moving"}},"81":{"label":"Vehicle Speed"},"82":{"label":"Accelerator Pedal Position"},"83":{"label":"Fuel Consumed"},"84":{"label":"Fuel level"},"85":{"label":"Engine RPM"},"86":{"label":"BLE 1 Humidity","dimension":"%RH"},"87":{"label":"Total Mileage"},"88":{"label":"Geofence zone 12","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"89":{"label":"Fuel level"},"90":{"label":"Door Status"},"91":{"label":"Geofence zone 13","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"92":{"label":"Geofence zone 14","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"93":{"label":"Geofence zone 15","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"94":{"label":"Geofence zone 16","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"95":{"label":"Geofence zone 17","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"96":{"label":"Geofence zone 18","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"97":{"label":"Geofence zone 19","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"98":{"label":"Geofence zone 20","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"99":{"label":"Geofence zone 21","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"100":{"label":"Program Number"},"101":{"label":"Module ID 8B"},"102":{"label":"Engine Worktime"},"103":{"label":"Engine Worktime (counted)"},"104":{"label":"BLE 2 Humidity","dimension":"%RH"},"105":{"label":"Total Mileage (counted)"},"106":{"label":"BLE 3 Humidity","dimension":"%RH"},"107":{"label":"Fuel Consumed (counted)"},"108":{"label":"BLE 4 Humidity","dimension":"%RH"},"110":{"label":"Fuel Rate"},"111":{"label":"AdBlue Level"},"112":{"label":"AdBlue Level"},"113":{"label":"FM battery level","dimesion":"%"},"114":{"label":"Engine Load"},"115":{"label":"Engine Temperature"},"118":{"label":"Axle 1 Load"},"119":{"label":"Axle 2 Load"},"120":{"label":"Axle 3 Load"},"121":{"label":"Axle 4 Load"},"122":{"label":"Axle 5 Load"},"123":{"label":"Control State Flags"},"124":{"label":"Agricultural Machinery Flags"},"125":{"label":"Harvesting Time"},"126":{"label":"Area of Harvest"},"127":{"label":"Mowing Efficiency"},"128":{"label":"Grain Mown Volume"},"129":{"label":"Grain Moisture"},"130":{"label":"Harvesting Drum RPM"},"131":{"label":"Gap Under Harvesting Drum"},"132":{"label":"Security State Flags"},"133":{"label":"Tachograph Total Vehicle Distance"},"134":{"label":"Trip Distance"},"135":{"label":"Tachograph Vehicle Speed"},"136":{"label":"Tacho Driver Card Presence"},"137":{"label":"Driver 1 States"},"138":{"label":"Driver 2 States"},"139":{"label":"Driver 1 Continuous Driving Time"},"140":{"label":"Driver 2 Continuous Driving Time"},"141":{"label":"Driver 1 Cumulative Break Time"},"142":{"label":"Driver 2 Cumulative Break Time"},"143":{"label":"Driver 1 Selected Activity Duration"},"144":{"label":"Driver 2 Selected Activity Duration"},"145":{"label":"Driver 1 Cumulative Driving Time"},"146":{"label":"Driver 2 Cumulative Driving Time"},"147":{"label":"Driver 1 ID High"},"148":{"label":"Driver 1 ID Low"},"149":{"label":"Driver 2 ID High"},"150":{"label":"Driver 2 ID Low"},"151":{"label":"Battery Temperature"},"152":{"label":"Battery Level"},"153":{"label":"Geofence zone 22","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"154":{"label":"Geofence zone 23","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"155":{"label":"Geofence zone 01","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"156":{"label":"Geofence zone 02","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"157":{"label":"Geofence zone 03","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"158":{"label":"Geofence zone 04","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"159":{"label":"Geofence zone 05","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"160":{"label":"DTC Faults"},"161":{"label":"Slope of Arm"},"162":{"label":"Rotation of Arm"},"163":{"label":"Eject of Arm"},"164":{"label":"Horizontal Distance Arm Vehicle"},"165":{"label":"Height Arm Above Ground"},"166":{"label":"Drill RPM"},"167":{"label":"Amount Of Spread Salt Square Meter"},"168":{"label":"Battery Voltage"},"169":{"label":"Amount Of Spread Fine Grained Salt"},"170":{"label":"Amount Of Coarse Grained Salt"},"171":{"label":"Amount Of Spread DiMix"},"172":{"label":"Amount Of Spread Coarse Grained Calcium"},"173":{"label":"Amount Of Spread Calcium Chloride"},"174":{"label":"Amount Of Spread Sodium Chloride"},"175":{"label":"Auto Geofence","values":{"0":"target left zone","1":"target entered zone "}},"176":{"label":"Amount Of Spread Magnesium Chloride"},"177":{"label":"Amount Of Spread Gravel"},"178":{"label":"Amount Of Spread Sand"},"179":{"label":"Digital Output 1"},"180":{"label":"Digital Output 2"},"181":{"label":"PDOP"},"182":{"label":"HDOP"},"183":{"label":"Width Pouring Left"},"184":{"label":"Width Pouring Right"},"185":{"label":"Salt Spreader Working Hours"},"186":{"label":"Distance During Salting"},"187":{"label":"Load Weight"},"188":{"label":"Retarder Load"},"189":{"label":"Cruise Time"},"190":{"label":"Geofence zone 24","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"191":{"label":"Geofence zone 25","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"192":{"label":"Geofence zone 26","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"193":{"label":"Geofence zone 27","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"194":{"label":"Geofence zone 28","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"195":{"label":"Geofence zone 29","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"196":{"label":"Geofence zone 30","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"197":{"label":"Geofence zone 31","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"198":{"label":"Geofence zone 32","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"199":{"label":"Trip Odometer"},"200":{"label":"Sleep Mode","values":{"0":"No Sleep","1":"GPS Sleep","2":"Deep Sleep"}},"201":{"label":"LLS 1 Fuel Level"},"202":{"label":"LLS 1 Temperature"},"203":{"label":"LLS 2 Fuel Level"},"204":{"label":"LLS 2 Temperature"},"205":{"label":"GSM Cell ID"},"206":{"label":"GSM Area Code"},"207":{"label":"RFID"},"208":{"label":"Geofence zone 33","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"209":{"label":"Geofence zone 34","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"210":{"label":"LLS 3 Fuel Level"},"211":{"label":"LLS 3 Temperature"},"212":{"label":"LLS 4 Fuel Level"},"213":{"label":"LLS 4 Temperature"},"214":{"label":"LLS 5 Fuel Level"},"215":{"label":"LLS 5 Temperature"},"216":{"label":"Geofence zone 35","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"217":{"label":"Geofence zone 36","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"218":{"label":"Geofence zone 37","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"219":{"label":"Geofence zone 38","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"220":{"label":"Geofence zone 39","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"221":{"label":"Geofence zone 40","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"222":{"label":"Geofence zone 41","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"223":{"label":"Geofence zone 42","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"224":{"label":"Geofence zone 43","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"225":{"label":"Geofence zone 44","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"226":{"label":"Geofence zone 45","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"227":{"label":"Geofence zone 46","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"228":{"label":"Geofence zone 47","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"229":{"label":"Geofence zone 48","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"230":{"label":"Geofence zone 49","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"231":{"label":"Geofence zone 50","values":{"0":"target left zone","1":"target entered zone","2":"over speeding end","3":"over speeding start"}},"232":{"label":"CNG Status"},"233":{"label":"CNG Used"},"234":{"label":"CNG Level"},"235":{"label":"Oil Level"},"236":{"label":"Alarm","values":{"0":"Reserved","1":"Alarm event occured"}},"237":{"label":"Network Type","values":{"0":"3G","1":"GSM","2":"4G","3":"LTE CAT M1","4":"LTE CAT NB1","99":"Unknown"}},"238":{"label":"User ID"},"239":{"label":"Ignition","values":{"0":"No","1":"Yes"}},"240":{"label":"Movement","values":{"0":"No","1":"Yes"}},"241":{"label":"GSM Operator"},"243":{"label":"Green Driving Event Duration","dimension":"ms"},"246":{"label":"Towing Detection Event","values":{"1":"Send Towing detected"}},"247":{"label":"Crash Detection","values":{"1":"Crash Detected","2":"Crash Trace Record","3":"Crash trace record(calibrated)"}},"248":{"label":"Immobilizer","values":{"0":"iButton not connected","1":"iButton connected (Immobilizer)","2":"iButton connected (Authorized Driving)"}},"249":{"label":"Jamming Detection","values":{"0":"Jamming Ended","1":"Jamming Detected"}},"250":{"label":"Trip Event","values":{"0":"Trip Ended","1":"Trip Started","2":"Business Status","3":"Private Status","4":"Custom Statuses","5":"Custom Statuses","6":"Custom Statuses","7":"Custom Statuses","8":"Custom Statuses","9":"Custom Statuses"}},"251":{"label":"Idling Event","values":{"0":"Idling ended event","1":"Idling started event"}},"252":{"label":"Unplug Event","values":{"1":"Send when unplug event happens"}},"253":{"label":"Green Driving Type","values":{"1":"Acceleration","2":"Braking","3":"Cornering"}},"254":{"label":"Green Driving Value","dimension":"g*10"},"255":{"label":"Overspeeding Event","dimension":"km/h"},"256":{"label":"VIN"},"257":{"label":"Crash trace data"},"258":{"label":"EcoMaximum"},"259":{"label":"EcoAverage"},"260":{"label":"EcoDuration"},"263":{"label":"BT Status","values":{"0":"BT is disabled","1":"BT Enabled, not device connected","2":"Device connected, BTv3 Only","3":"Device connected, BLE only","4":"Device connected, BLE + BT"}},"264":{"label":"Barcode ID"},"269":{"label":"Escort LLS Temperature #1"},"270":{"label":"BLE Fuel Level #1"},"271":{"label":"Escort LLS Battery Voltage #1"},"272":{"label":"Escort LLS Temperature #2"},"273":{"label":"BLE Fuel Level #2"},"274":{"label":"Escort LLS Battery Voltage #2"},"275":{"label":"Escort LLS Temperature #3"},"276":{"label":"BLE Fuel Level #3"},"277":{"label":"Escort LLS Battery Voltage #3"},"278":{"label":"Escort LLS Temperature #4"},"279":{"label":"BLE Fuel Level #4"},"280":{"label":"Escort LLS Battery Voltage #4"},"281":{"label":"fault codes"},"282":{"label":"Fault Codes"},"283":{"label":"Driving State","values":{"1":"Ignition ON","2":"Driving","3":"Ignition OFF"}},"284":{"label":"Driving Records"},"285":{"label":"Blood alcohol content"},"303":{"label":"Instant Movement"},"304":{"label":"Vehicles Range On Battery"},"305":{"label":"Vehicles Range On Additional Fuel"},"306":{"label":"BLE Fuel Frequency #1"},"307":{"label":"BLE Fuel Frequency #2"},"308":{"label":"BLE Fuel Frequency #3"},"309":{"label":"BLE Fuel Frequency #4"},"317":{"label":"Crash event counter"},"325":{"label":"VIN"},"327":{"label":"UL202-02 Sensor Fuel level"},"329":{"label":"AIN Speed"},"331":{"label":"BLE 1 Custom #1"},"332":{"label":"BLE 2 Custom #1"},"333":{"label":"BLE 3 Custom #1"},"334":{"label":"BLE 4 Custom #1"},"335":{"label":"BLE Luminosity #1"},"336":{"label":"BLE Luminosity #2"},"337":{"label":"BLE Luminosity #3"},"338":{"label":"BLE Luminosity #4"},"380":{"label":"Digital output 3"},"381":{"label":"Ground Sense"},"385":{"label":"Beacon"},"387":{"label":"ISO6709  Coordinates"},"388":{"label":"Module ID 17B"},"389":{"label":"OBD OEM Total Mileage"},"390":{"label":"OBD OEM Fuel Level"},"391":{"label":"Private mode"},"403":{"label":"Driver Name"},"404":{"label":"Driver card license type"},"405":{"label":"Driver Gender"},"406":{"label":"Driver Card ID"},"407":{"label":"Driver card expiration date"},"408":{"label":"Driver Card place of issue"},"409":{"label":"Driver Status Event"},"411":{"label":"OEM Battery charge level"},"412":{"label":"OEM Battery power consumption"},"449":{"label":"Ignition On Counter","values":{"0":"Disable","1":"Enable"}},"463":{"label":"BLE 1 Custom #2"},"464":{"label":"BLE 1 Custom #3"},"465":{"label":"BLE 1 Custom #4"},"466":{"label":"BLE 1 Custom #5"},"467":{"label":"BLE 2 Custom #2"},"468":{"label":"BLE 2 Custom #3"},"469":{"label":"BLE 2 Custom #4"},"470":{"label":"BLE 2 Custom #5"},"471":{"label":"BLE 3 Custom #2"},"472":{"label":"BLE 3 Custom #3"},"473":{"label":"BLE 3 Custom #4"},"474":{"label":"BLE 3 Custom #5"},"475":{"label":"BLE 4 Custom #2"},"476":{"label":"BLE 4 Custom #3"},"477":{"label":"BLE 4 Custom #4"},"478":{"label":"BLE 4 Custom #5"},"483":{"label":"UL202-02 Sensor Status"},"500":{"label":"MSP500 vendor name"},"501":{"label":"MSP500 vehicle number"},"502":{"label":"MSP500 speed sensor"},"517":{"label":"Security State Flags P4"},"518":{"label":"Control State Flags P4"},"519":{"label":"Indicator State Flags P4"},"520":{"label":"Agricultural State Flags P4"},"521":{"label":"Utility State Flags P4"},"522":{"label":"Cistern State Flags P4"},"543":{"label":"Hybrid System Voltage"},"544":{"label":"Hybrid System Current"},"636":{"label":"UMTS/LTE Cell ID"},"755":{"label":"OEM Remaining distance"},"759":{"label":"Fuel Type","values":{"0":"Not available","1":"Gasoline","2":"Methanol","3":"Ethanol","4":"Diesel","5":"LPG","6":"CNG","7":"Propane","8":"Electric","9":"Bifuel running Gasoline","10":"Bifuel running Methanol","11":"Bifuel running Ethanol","12":"Bifuel running LPG","13":"Bifuel running CNG","14":"Bifuel running Propane","15":"Bifuel running Electricity","16":"Bifuel running electric and combustion engine","17":"Hybrid gasoline","18":"Hybrid Ethanol","19":"Hybrid Diesel","20":"Hybrid Electric","21":"Hybrid running electric and combustion engine","22":"Hybrid Regenerative","23":"Bifuel running diesel"}},"855":{"label":"LNG Used"},"856":{"label":"LNG Used (counted)"},"857":{"label":"LNG Level"},"858":{"label":"LNG Level"}};
  }
}

module.exports = Codec8e;
