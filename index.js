
module.exports = json2hash
json2hash.toHash = json2hash
json2hash.toJson = hash2json
/**
 * Json transform hash
 * @param {Object} model JSON object.
 *  
 */
function json2hash(model)
{
    function onParser(json, key, data) {
        var keys = Object.keys(json);
        for (let i = 0; i < keys.length; i++) {
            if (typeof json[keys[i]] === 'object') {
				if (json[keys[i]].length === undefined) {
					// is object
					if (JSON.stringify(json[keys[i]]) === '{}') {
						data[key+keys[i]] = '{}';
					} else {
						data = onParser(json[keys[i]], key+keys[i]+".", data);
					}
                } else {
                    // is array
                    if (JSON.stringify(json[keys[i]]) === '[]') {
                        data[key+keys[i]] = '[]';
                    } else {
                        for (let j = 0; j < json[keys[i]].length; j++) {
                            if (typeof json[keys[i]][j] === 'object') {
                                data = onParser(json[keys[i]][j], key+keys[i]+"."+j+".", data);
                            } else {
                                data[key+keys[i]+"."+j] = json[keys[i]][j];
                            }
                        }
                    }
                }
            } else {
                data[key+keys[i]] = json[keys[i]];
            }
        }

        return data;
    }

    var data = {};
    data = onParser(model, "", data);
    return data;
}

/**
 * Hash transform json
 * @param {Object} hash object.
 *  
 */
function hash2json(hash)
{
    var model = {};

	function fieldParser(field, value, data, prefield)
	{
		function getVal(v)
		{
			if (v === '{}')
				return {};
			else if (v === '[]')
				return [];
			else
				return v;
		}

		value = getVal(value);

		if (field.includes('.')) {
			var tmp = field.split('.');
			if (isNaN(tmp[0])) {
				if (tmp.length == 2) {
					if (isNaN(tmp[1])) {
						// is object
						data[tmp[0]] = data[tmp[0]] ? data[tmp[0]] : {};
						data[tmp[0]][tmp[1]] = value;
					} else {
						// is array
						data[tmp[0]] = data[tmp[0]] ? data[tmp[0]] : [];
						data[tmp[0]][parseInt(tmp[1])] = value;
					}
				} else {
					data[tmp[0]] = data[tmp[0]] ? data[tmp[0]] : (isNaN(tmp[1]) ? {} : []);
					var newfield = '';
					for (let i = 1; i < tmp.length; i++) {
						newfield += tmp[i];

						if ((i+1) < tmp.length)
							newfield += '.';
					}
					data = fieldParser(newfield, value, data, tmp[0]);
				}
			} else {
				data[prefield][tmp[0]] = data[prefield][tmp[0]] ? data[prefield][tmp[0]] : {};
				data[prefield][parseInt(tmp[0])][tmp[1]] = value;
			}

		} else {
			data[field] = value;
		}

		return data;
	}

	var keys = Object.keys(hash);
	for (let i = 0; i < keys.length; i++) {
		model = fieldParser(keys[i], hash[keys[i]], model);
	}

	return model;
}
