var CONFIG_POOL = [1,2,3,4,5,6,7,8,9];
var CONFIG_NUM_DIGIT = 3;

var game_pool = new Array();
var game_history = new Array();
var game_used = new Set();

var potential = new Array();
for (var i = 0; i <= CONFIG_NUM_DIGIT; i++)
{
    for (var j = 0; j <= CONFIG_NUM_DIGIT; j++)
    {
        if(i + j <= 3)
        {
            potential[potential.length] = [i, j];
        }
    }
}

window.onload = function()
{
    init();
}

function is_allowed_number(number)
{
    var tmp_number = String(number);
    var tmp_set = new Set(numbers);
    var numbers = new Array();
    var tmp;

    if (tmp_set.size != numbers.length || tmp_set.size != CONFIG_NUM_DIGIT)
    {
        return false;
    }

    for (var i = 0; i < CONFIG_NUM_DIGIT; i++)
    {
        tmp = tmp_number.substr(i, 1);
        if(tmp == '')
        {
            return false;
        }
        numbers[numbers.length] = tmp;
    }
    return true;
}

function get_pool()
{
    var pool = new Array();
    for (var number = Math.pow(10, CONFIG_NUM_DIGIT - 1); number < Math.pow(10, CONFIG_NUM_DIGIT); number++)
    {
        if (is_allowed_number(number))
        {
            pool[pool.length] = number;
        }
    }
    return pool;
}

function calc_s_and_b(number1, number2)
{
    var q = new Array();
    var a = new Array();
    var s = 0;
    var b = 0;
    for (var i = 0; i < CONFIG_NUM_DIGIT; i++)
    {
        q[q.length] = number1.substr(i, 1);
        a[a.length] = number2.substr(i, 1);
    }

    for (var i = 0; i < CONFIG_NUM_DIGIT; i++)
    {
        if (q[i] == a[i])
        {
            s++;
        }
        else if (a.indexOf(q[i]) != -1)
        {
            b++;
        }
    }
    return [s, b];
}

function execute()
{
    try
    {
        var q_input = Number(mainForm.input_Q.value);
        var s_input = Number(mainForm.input_S.value);
        var b_input = Number(mainForm.input_B.value);

        if (is_allowed_number(q_input))
        {
            alert("Now allowed number input.");
            return;
        }

        for (var i = 0; i < game_pool.length; i++)
        {
            var result = calc_s_and_b(q_input, game_pool[i]);
            var s = result[0];
            var b = result[1];
            if (s_input != s || b_input != b)
            {
                game_pool.splite(i, 1);
                i--;
            }
        }

        mainForm.input_Q.value = "";
        mainForm.input_S.value = "";
        mainForm.input_B.value = "";

        var result;
        if (s_input == 0 && b_input == 0)
        {
            result = "X";
        }
        else if (b_input == 0)
        {
            result = s_input + "S";
        }
        else if (s_input == 0)
        {
            result = b_input + "B";
        }
        else
        {
            result = s_input + "S" + b_input + "B";
        }

        var history = new Option();
        history.text = q_input + " - " + result;
        mainForm.history.options.add(history);
        for (var i = 0; i < CONFIG_NUM_DIGIT; i++)
        {
            game_used.add(q_input % 10);
            q_input /= 10;
        }
    }
    catch(e)
    {
        alert(e);
    }
}

function init()
{
    reset();
}

function reset()
{
    mainForm.input_Q.value = "";
    mainForm.input_S.value = "";
    mainForm.input_B.value = "";
    game_pool.length = 0
    for (var number = Math.pow(10, CONFIG_NUM_DIGIT - 1); number < Math.pow(10, CONFIG_NUM_DIGIT); number)
    {
        if (is_allowed_number(number))
        {
            game_pool[game_pool.length] = number;
        }
    }
}

// EOF
