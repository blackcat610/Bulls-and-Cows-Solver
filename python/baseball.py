# -*- coding: utf-8 -*-

import time

TYPE_MODE_TEST = 'TEST'
TYPE_MODE_DEBUG = 'DEBUG'
TYPE_MODE_GAME = 'GAME'

CONFIG_POOL = [1,2,3,4,5,6,7,8,9]
CONFIG_NUM_DIGIT = 3
CONFIG_MODE = TYPE_MODE_GAME

POTEN = [] # POTENTIAL OF STRIKE, BALL PAIRS
#POTEN = [(0, 0), (0, 1), (0, 2), (0, 3), (1, 0), (1, 1), (1, 2), (2, 0), (2, 1), (3, 0)]
for s in range(CONFIG_NUM_DIGIT + 1):
    for b in range(CONFIG_NUM_DIGIT + 1):
        if s + b <= CONFIG_NUM_DIGIT:
            POTEN.append((s, b))
WIN_KEY = '%dS0B'%(CONFIG_NUM_DIGIT)

def is_allowed_number(number):
    _number = str(number)
    return len(_number) == CONFIG_NUM_DIGIT and \
           len(set(_number)) == CONFIG_NUM_DIGIT and \
           all(int(i) in CONFIG_POOL for i in _number)

SET_POOL = set(CONFIG_POOL)
ALL_NUMBERS = [number for number in range(10 ** (CONFIG_NUM_DIGIT - 1), 10 ** CONFIG_NUM_DIGIT) if is_allowed_number(number)]

TEST_ACCELERATION_INDEX = {}
def get_to_index(SB_history):
    a = TEST_ACCELERATION_INDEX
    for key in SB_history:
        if key not in a:
            return None
        a = a[key]
    return a['Q']

def set_to_index(SB_history, new_question):
    a = TEST_ACCELERATION_INDEX
    for key in SB_history[:-1]:
        a = a[key]
    a[SB_history[-1]] = {'Q': new_question}

def calc_s_and_b(q, a):
    _q = str(q)
    _a = str(a)
    s = 0
    b = 0
    for i in range(CONFIG_NUM_DIGIT):
        if _q[i] == _a[i]:
            s += 1
        elif _q[i] in _a:
            b += 1
    return s, b

def calc_pool(q, s, b, pool):
    result = 0
    _q = str(q)
    for a in pool:
        _s, _b = calc_s_and_b(_q, a)
        if s == _s and b == _b:
            result += 1
    return result

def update_pool(q, s, b, pool):
    result = []
    _q = str(q)
    for a in pool:
        _s, _b = calc_s_and_b(_q, a)
        if s == _s and b == _b:
            result.append(a)
    return result

def calc_best_question(a_pool, history):
    q_pool = []
    before_count = len(a_pool)
    if before_count == 1:
        return a_pool[0], True
    before_count = float(before_count)

    duplicates = set()
    for q in ALL_NUMBERS:
        q_str = str(q)
        for i in CONFIG_POOL:
            if i not in history:
                q_str = q_str.replace(str(i), 'X')
        if q_str in duplicates:
            continue
        duplicates.add(q_str)
        q_pool.append(q)

    best = 0.0
    recom = None
    _q = 0
    dups = []

    if CONFIG_MODE == TYPE_MODE_DEBUG:
        print 'A Pool: %s'%(a_pool)
    for q in q_pool:
        result = {}
        cache = {}
        total = 0.0
        for s, b in POTEN:
            remain_count = calc_pool(q, s, b, a_pool)
            if remain_count == 0:
                continue
            total += remain_count
            key = '%dS%dB'%(s,b)
            cache[key] = remain_count
            result[key] = remain_count

        is_duplicate = False
        for dup in dups:
            if dup.keys() == cache.keys():
                check = []
                for key in cache:
                    check.append( cache[key] == dup[key] )
                if all(check):
                    is_duplicate = True
                    break

        if is_duplicate:
            continue
        dups.append(cache)

        if CONFIG_MODE == TYPE_MODE_DEBUG:
            print 'Answer: %s'%(q)
        score = 0.0
        for key in sorted(result.keys(), key=lambda x: result[x], reverse=True):
            probability = result[key] / before_count
            if key == WIN_KEY:
                score += probability * (before_count - result[key] + 1) / before_count
            else:
                score += probability * (before_count - result[key]) / before_count
            if CONFIG_MODE == TYPE_MODE_DEBUG:
                print '%s: Count: %s, Probability: %.2f%%'%(key, result[key], probability * 100)
        score *= 10
        if CONFIG_MODE == TYPE_MODE_DEBUG:
            print 'Score: %.2f'%(score)
        if best < score:
            best = score
            recom = result
            _q = q

    assert recom is not None

    if CONFIG_MODE == TYPE_MODE_DEBUG or CONFIG_MODE == TYPE_MODE_GAME:
        print 'Recommend Answer: %d'%(_q)
    result = recom
    score = 0.0
    for key in sorted(result.keys(), key=lambda x: result[x], reverse=True):
        probability = result[key] / before_count
        if key == WIN_KEY:
            score += probability * (before_count - result[key] + 1) / before_count
        else:
            score += probability * (before_count - result[key]) / before_count
        if CONFIG_MODE == TYPE_MODE_DEBUG or CONFIG_MODE == TYPE_MODE_GAME:
            print '%s: Count: %s, Probability: %.2f%%'%(key, result[key], probability * 100)
    score *= 10
    if CONFIG_MODE == TYPE_MODE_DEBUG or CONFIG_MODE == TYPE_MODE_GAME:
        print 'Score: %.2f'%(score)
    return _q, len(result) <= 1 # FINISH

def test_all_numbers():
    answers = ALL_NUMBERS
    all_count = 0
    finish_count = 0
    len_answers = len(ALL_NUMBERS)
    analyze = {}
    now = time.time()
    TEST_ACCELERATION_INDEX = {}
    for answer in answers:
        pool = ALL_NUMBERS
        history = set()
        SB_history = ['FIRST']
        count = 0
        while True:
            count += 1
            all_count += 1
            q = get_to_index(SB_history)
            if q is None:
                q, _ = calc_best_question(pool, history)
                set_to_index(SB_history, q)

            s, b = calc_s_and_b(q, answer)
            if s == CONFIG_NUM_DIGIT:
                if count not in analyze:
                    analyze[count] = 0
                analyze[count] += 1
                finish_count += 1
                if finish_count % 50 == 0:
                    print '%d/%d Finish'%(finish_count, len_answers)
                break

            SB_history.append('%dS%dB'%(s, b))

            pool = update_pool(q, s, b, pool)
            for i in range(CONFIG_NUM_DIGIT):
                history.add(q % 10)
                q /= 10
    print 'PTIME: %d'%(time.time() - now)
    print 'NUMBERS: %d'%(len(ALL_NUMBERS))
    print 'AVERAGE: %.2f'%(float(all_count) / len(ALL_NUMBERS))
    print 'COUNT ANALYZE: %s'%(analyze)

def interactive_game():
    pool = ALL_NUMBERS
    history = set()
    count = 0
    while True:
        q, is_finished = calc_best_question(pool, history)
        if is_finished:
            # START NEW GAME
            print 'Game Finished! Answer: %d, Question Count: %d'%(q, count)
            print ''
            print 'Press Enter to New Game!'
            raw_input()
            pool = ALL_NUMBERS
            history.clear()
            count = 0
            continue
        count += 1
        print ''
        s = input('S: ')
        b = input('B: ')
        print ''
        pool = update_pool(q, s, b, pool)

        # HISTORY UPDATE (USED NUMBER)
        for i in range(CONFIG_NUM_DIGIT):
            history.add(q % 10)
            q /= 10

if __name__ == "__main__":
    print u"""'Bulls and Cows' Solver
Author: blackcat610@github.com (메이플스토리 아케인서버 뉴메타소프트)
Date: 2017. 10. 15
"""
    if CONFIG_MODE == TYPE_MODE_TEST:
        test_all_numbers()
    else:
        interactive_game()

# EOF
