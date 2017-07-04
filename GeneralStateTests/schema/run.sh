echo -e "$(find .. -name '*.json' ! -path '../schema/*.json')" | node validate.js
