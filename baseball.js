var CONFIG_POOL = new Set([1,2,3,4,5,6,7,8,9]);
var CONFIG_NUM_DIGIT = 3;

function is_allowed_number(number)
{
    var numbers = new Array();
    var tmp_number = String(number);
    var tmp;
    for (var i = 0; i < CONFIG_NUM_DIGIT; i++)
    {
        tmp = tmp_number.substr(i, 1);
        if (tmp == '')
        {
            return false;
        }
        else if (CONFIG_POOL.has(Number(tmp)) == false)
        {
            return false;
        }
        numbers[numbers.length] = tmp;
    }

    var tmp_set = new Set(numbers);
    if (tmp_set.size != tmp_number.length || tmp_set.size != CONFIG_NUM_DIGIT)
    {
        return false;
    }
    return true;
}

function get_pool()
{
    var pool = new Array();
    for (var number = Math.pow(10, CONFIG_NUM_DIGIT - 1); number < Math.pow(10, CONFIG_NUM_DIGIT); number++)
    {
        if (is_allowed_number(number) == true)
        {
            pool[pool.length] = String(number);
        }
    }
    return pool;
}

var game_pool = new Array();
var game_all_pool = get_pool();
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

function result_formatter(s, b)
{
    if (s == 0 && b == 0)
    {
        return "X";
    }
    else if (b == 0)
    {
        return s + "S";
    }
    else if (s == 0)
    {
        return b + "B";
    }
    else
    {
        return s + "S" + b + "B";
    }
}

function calc_pool(q, s, b)
{
    var count = 0;
    for (var i = 0; i < game_pool.length; i++)
    {
        var result = calc_s_and_b(q, game_pool[i]);
        var _s = result[0];
        var _b = result[1];
        if (_s == s && _b == b)
        {
            count++;
        }
    }
    return count;
}

function calc_best_question()
{
    var q_pool = [];
    var q_dups = new Set();

    for (var i = 0; i < game_all_pool.length; i++)
    {
        q_str = game_all_pool[i];

        iter = CONFIG_POOL.values();
        element = iter.next();
        while(element['done'] == false)
        {
            if (game_used.has(element['value']) == false)
            {
                q_str = q_str.replace(String(element['value']), "X");
            }
            element = iter.next();
        }
        if (q_dups.has(q_str) == true)
        {
            continue;
        }
        q_dups.add(q_str);
        q_pool[q_pool.length] = game_all_pool[i];
    }

    var before_count = game_pool.length;
    var best = -1.0;
    var best_q = 0;
    var best_total = 0;
    var best_info = {};
    for (var i = 0; i < q_pool.length; i++)
    {
        var score = 0.0;
        var total_count = 0.0;
        var sb_info = {};
        for (var j = 0; j < potential.length; j++)
        {
            var s = potential[j][0];
            var b = potential[j][1];
            var remain_count = calc_pool(q_pool[i], s, b);
            if (remain_count == 0)
            {
                continue;
            }
            total_count += remain_count;
            sb_info[String(s)+String(b)] = remain_count;
        }

        for (var j in sb_info)
        {
            var probability = sb_info[j] / before_count;
            if (Number(j.substr(0, 1)) == CONFIG_NUM_DIGIT)
            {
                score += probability * (before_count - sb_info[j] + 1) / before_count
            }
            else
            {
                score += probability * (before_count - sb_info[j]) / before_count
            }
        }
        if (score > best)
        {
            best = score;
            best_total = total_count;
            best_q = q_pool[i];
            best_info = sb_info;
        }
    }
    result_str = "Recommend Answer: " + best_q + ", Score: " + best.toFixed(2);
    var count = 0;
    for (var i = 0; i < potential.length; i++)
    {
        var s = potential[i][0];
        var b = potential[i][1];
        var key = String(s) + String(b);
        if (best_info[key] != undefined)
        {
            count++;
            var probability = best_info[key] / best_total * 100;
            var s = key.substr(0, 1);
            var b = key.substr(1, 1);
            result_str += "\n" + result_formatter(s, b) + ": Count: " + best_info[key] + ", Probability: " + probability.toFixed(2);
        }
    }
    if (count <= 1)
    {
        mainForm.txt_answer.value = "Game Finished! Answer: " + best_q + "\nPress Reset to New Game!";
        mainForm.input_S.value = "3";
    }
    else
    {
        mainForm.txt_answer.value = result_str;
    }
    mainForm.input_Q.value = best_q;
}

function execute()
{
    try
    {
        var q_input = mainForm.input_Q.value;
        var s_input = Number(mainForm.input_S.value);
        var b_input = Number(mainForm.input_B.value);

        if (is_allowed_number(q_input) == false)
        {
            alert("Not allowed number input.");
            return;
        }

        var backups = [];
        for (var i = 0; i < game_pool.length; i++)
        {
            var result = calc_s_and_b(q_input, game_pool[i]);
            var s = result[0];
            var b = result[1];
            if (s_input != s || b_input != b)
            {
                backups[backups.length] = game_pool.splice(i, 1)[0];
                i--;
            }
        }

        if( game_pool.length == 0)
        {
            game_pool = backups;
            mainForm.input_S.value = "";
            mainForm.input_B.value = "";
            alert("Not allowed number input.");
            return;
        }
        mainForm.input_Q.value = "";
        mainForm.input_S.value = "";
        mainForm.input_B.value = "";

        var result = result_formatter(s_input, b_input);

        var history = new Option();
        history.text = q_input + " - " + result;
        mainForm.history.options.add(history);
        q_input = Number(q_input);
        for (var i = 0; i < CONFIG_NUM_DIGIT; i++)
        {
            game_used.add(parseInt(q_input % 10));
            q_input /= 10;
        }
        calc_best_question()
    }
    catch(e)
    {
        alert(e);
    }
}

function init()
{
    reset_game();
}

function reset_game()
{
    mainForm.input_Q.value = "";
    mainForm.input_S.value = "";
    mainForm.input_B.value = "";
    mainForm.history.options.length = 0;
    mainForm.txt_answer.value = "";
    game_pool = get_pool();
    game_used = new Set();
    calc_best_question();
}

// EOF
