import flask
from flask import request, jsonify, render_template
from hhl_algo import hhl

app = flask.Flask(__name__)
app.config["DEBUG"] = True


@app.route('/', methods=['GET'])
def home():
    return render_template('Index.html')

@app.route('/api', methods=['POST','GET'])
def api_home():
    return render_template('API Intro.html')



def Data(A, b):
    success = False
    results = None
    if A != None and b != None:
        results = hhl(A, b) #here A and b are matrix.toString()
        success = True
    data = {'success': success,
            'results': results,
            'A': A,
            'b': b}
    return data

@app.route('/api/', methods=['POST','GET'])
def result():
    A  = request.args.get('A', None)
    b  = request.args.get('b', None)
    data = Data(A, b)
    return jsonify(data)

if __name__ == "__main__":
    app.run()