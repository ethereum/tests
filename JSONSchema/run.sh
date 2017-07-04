echo -e "$(find ../GeneralStateTests -name '*.json' ! -path '../schema/*.json')" | node validate.js
