import os, glob, sys, subprocess, yaml, pdb, json, binascii

def wat2wasm(code):
  with open("tmp.wast", "w+") as f:
    f.write(code)

  result = subprocess.run(['./wat2wasm',  'tmp.wast', '-o', 'tmp.wasm'], stdout=subprocess.PIPE, stderr=subprocess.PIPE)

  with open('tmp.wasm', 'rb') as f:
    result = f.read()

  return result.hex()

def convert_state_test(file_name):
  state_test = None

  state_test = yaml.load(open(file_name, 'r').read().rstrip())

  if not state_test:
    print("foo")
    sys.exit(-1)

  for test_case in state_test.keys():
    # conver pre account code
    for addr in state_test[test_case]['pre']:
      if state_test[test_case]['pre'][addr]['code'] != ['']:
        state_test[test_case]['pre'][addr]['code'] = wat2wasm(state_test[test_case]['pre'][addr]['code'])

    if state_test[test_case]['transaction']['data'] != ['']:
      for i in range(0, len(state_test[test_case]['transaction']['data'])):
        state_test[test_case]['transaction']['data'][i] = wat2wasm(state_test[test_case]['transaction']['data'][i])

  with open(file_name.strip('.yml')+'.json', 'w') as f:
    f.write(json.dumps(state_test, indent=4, sort_keys=True))
    
for file_name in glob.glob('*.yml'):
  convert_state_test(file_name)
