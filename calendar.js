/***
 * @this js is for calendar 2016/10/13
 * @authoer huangzhao
 */

/**
 * 轮播开始
 * swiper - swiper.js
 * @version v1.0.0
 * @license MIT
 */

(function (name, definition) {
    if (typeof define === 'function') {
        define(definition);
    } else {
        this[name] = definition();
    }
})('Swiper', function () {

    /**
     *
     * @param options
     * @constructor
     */
    function Swiper(options) {
        this.version = '1.4.1';
        this._default = {container: '.swiper', item: '.item', direction: 'vertical', activeClass: 'active', threshold: 50, duration: 300};
        this._options = extend(this._default, options);
        this._start = {};
        this._move = {};
        this._end = {};
        this._prev = 0;
        this._current = 0;
        this._offset = 0;
        this._goto = -1;
        this._eventHandlers = {};

        this.$container = document.querySelector(this._options.container);
        this.$items = this.$container.querySelectorAll(this._options.item);
        this.count = this.$items.length;

        this._width = this.$container.offsetWidth;
        this._height = this.$container.offsetHeight;

        this._init();
        this._bind();
    }

    /**
     * initial
     * @private
     */
    Swiper.prototype._init = function () {
        var me = this;
        var width = me._width;
        var height = me._height;


        var w = width;
        var h = height * me.count;

        if (me._options.direction === 'horizontal') {
            w = width * me.count;
            h = height;
        }

        me.$container.style.width = w + 'px';
        me.$container.style.height = h + 'px';

        Array.prototype.forEach.call(me.$items, function ($item, key) {
            $item.style.width = width + 'px';
            $item.style.height = height + 'px';
        });

        me._activate(0);
    };

    /**
     * bind event listener
     * @private
     */
    Swiper.prototype._bind = function () {
        var me = this;

        this.$container.addEventListener('touchstart', function (e) {
            me._start.x = e.changedTouches[0].pageX;
            me._start.y = e.changedTouches[0].pageY;

            me.$container.style['-webkit-transition'] = 'none';
            me.$container.style.transition = 'none';

        }, false);

        this.$container.addEventListener('touchmove', function (e) {
            me._move.x = e.changedTouches[0].pageX;
            me._move.y = e.changedTouches[0].pageY;

            var distance = me._move.y - me._start.y;
            var transform = 'translate3d(0, ' + (distance - me._offset) + 'px, 0)';

            if (me._options.direction === 'horizontal') {
                distance = me._move.x - me._start.x;
                transform = 'translate3d(' + (distance - me._offset) + 'px, 0, 0)';
            }

            me.$container.style['-webkit-transform'] = transform;
            me.$container.style.transform = transform;

            e.preventDefault();
        }, false);

        this.$container.addEventListener('touchend', function (e) {
            me._end.x = e.changedTouches[0].pageX;
            me._end.y = e.changedTouches[0].pageY;


            var distance = me._end.y - me._start.y;
            if (me._options.direction === 'horizontal') {
                distance = me._end.x - me._start.x;
            }

            me._prev = me._current;
            if (distance > me._options.threshold) {
                me._current = me._current === 0 ? 0 : --me._current;
                me._show(me._current);
                e.preventDefault();
            } else if (distance < -me._options.threshold) {
                me._current = me._current < (me.count - 1) ? ++me._current : me._current;
                me._show(me._current);
                e.preventDefault();
            }
        }, false);

        this.$container.addEventListener('transitionEnd', function (e) {
        }, false);

        this.$container.addEventListener('webkitTransitionEnd', function (e) {
            if (e.target !== me.$container) {
                return false;
            }

            if (me._current != me._prev || me._goto > -1) {
                me._activate(me._current);
                var cb = me._eventHandlers.swiped || noop;
                cb.apply(me, [me._prev, me._current]);
                me._goto = -1;
            }
            e.preventDefault();
        }, false);
    };

    /**
     * show
     * @param index
     * @private
     */
    Swiper.prototype._show = function (index) {
        this._offset = index * this._height;
        var transform = 'translate3d(0, -' + this._offset + 'px, 0)';

        if (this._options.direction === 'horizontal') {
            this._offset = index * this._width;
            transform = 'translate3d(-' + this._offset + 'px, 0, 0)';
        }

        var duration = this._options.duration + 'ms';

        this.$container.style['-webkit-transition'] = duration;
        this.$container.style.transition = duration;
        this.$container.style['-webkit-transform'] = transform;
        this.$container.style.transform = transform;
    };

    /**
     * activate
     * @param index
     * @private
     */
    Swiper.prototype._activate = function (index){
        var clazz = this._options.activeClass;
        Array.prototype.forEach.call(this.$items, function ($item, key){
            $item.classList.remove(clazz);
            if (index === key) {
                $item.classList.add(clazz);
            }
        });
    };

    /**
     * goto x page
     */
    Swiper.prototype.go = function (index) {
        if(index < 0 || index > this.count - 1 || index === this._current){
            return;
        }

        if (index === 0) {
            this._current = 0;
            this._prev = 0;
        }else{
            this._current = index;
            this._prev = index - 1;
        }

        this._goto = index;
        this._show(this._current);

        return this;
    };

    /**
     * show next page
     */
    Swiper.prototype.next = function () {
        if (this._current >= this.count - 1) {
            return;
        }
        this._prev = this._current;
        this._show(++this._current);
        return this;
    };

    /**
     * 新增   prev page  2016／10/19
     */
    Swiper.prototype.prev = function () {
        if(this._current < 1){
            return;
        }
        this._prev = this._current;
        this._show(--this._current);
        return this;
    };
    /**
     *
     * @param {String} event
     * @param {Function} callback
     */
    Swiper.prototype.on = function (event, callback) {
        if (this._eventHandlers[event]) {
            throw new Error('event ' + event + ' is already register');
        }
        if (typeof callback !== 'function') {
            throw new Error('parameter callback must be a function');
        }

        this._eventHandlers[event] = callback;

        return this;
    };

    /**
     * simple `extend` method
     * @param target
     * @param source
     * @returns {*}
     */
    function extend(target, source) {
        for (var key in source) {
            target[key] = source[key];
        }

        return target;
    }

    /**
     * noop
     */
    function noop() {

    }

    /**
     * export
     */
    return Swiper;
});

//  轮播结束

(function(){
    'use strict';
    // 日历－开始
    var calendar = function(time,obj){
        obj = obj || 'body';
        var _NewDate = new Date(time.split('-')[0],time.split('-')[1] - 1) || new Date(),
            _nYear = _NewDate.getFullYear(),    //年
            _nMonth = _NewDate.getMonth() + 1;  //月
        
        //  某月有多少天
        var _curMonthDate = getDayNum(_nYear,_nMonth);
        //  box

        // 日历外框
        var _calendarBox = document.createElement('div');
        _calendarBox.setAttribute('class','calendar-box zShow swiper-slide item');


        //  星期
        var _weekList = document.getElementsByClassName('week-list')[0],
            _str = '<li>日</li><li>一</li><li>二</li><li>三</li><li>四</li><li>五</li><li>六</li>';
        _weekList.innerHTML = _str; //  把星期渲染到页面中

        //  日
        var _dayBox = '<ul class="day-list"></ul>',
            _dayLi ='';

        var _dayList = document.createElement('ul');
        _dayList.setAttribute('class','day-list');
        
        //  求当月一号是星期几
        var _newDate = new Date(_nYear,_nMonth - 1,1),
            _curMonthWeek = _newDate.getDay();
        for(var i=1;i<= 42;i++){
            if(i <= _curMonthWeek){
                _dayLi += '<li class="new"></li>';
            }else if (i >= _curMonthWeek && i <= _curMonthDate + _curMonthWeek){
                _dayLi += '<li data-time=' + _nYear + '-' + addZero(_nMonth) + '-' + addZero((i - _curMonthWeek)) + '><p class="text">' + (i - _curMonthWeek) + '</p><p class="end"></p><p class="price"></p><p class="dingwei"><i class="chinas zHide">●</i><i class="locals zHide">●</i></p><p class="jieqi"></p></li>';
            }else{
                _dayLi += '<li class="old"></li>';
            }
        }
        _dayList.innerHTML = _dayLi;
        _calendarBox.appendChild(_dayList);  // 天  放入到calendar盒子中

        var _boxCenter = document.getElementsByClassName('box-center')[0];
        _boxCenter.appendChild(_calendarBox);

        //  得到当月多少天天
        function getDayNum(year,month){
            //  闰月
            var _veader = !(year % 400) || (!(year %4) && (year % 100) ),
                _num;
            switch (month) {
                case 2:
                    _num = _veader ? 29 : 28;
                    break;
                case 1:
                case 3:
                case 7:
                case 8:
                case 10:
                case 12:
                    _num = 31;
                    break;
                default:
                    _num = 30;
            } 
            return _num;
        }
    };
    var addZero = function (num) {
        return num <= 9 ? '0' + num : '' + num;
    };
    calendar('2016-10','.box-center');
    calendar('2016-11','.box-center');
    calendar('2016-12','.box-center');
    calendar('2017-01','.box-center');
    calendar('2017-02','.box-center');
    /**
     * @sellOut 售罄
     */
    // $('[data-time=2016-8-8]')
    // console.log(document.querySelector("[data-time='2016-10-16']"));

    function sellOut(sel,price){
        var _sel = document.querySelector(sel);
        if(!_sel.className.match(new RegExp('(\\s|^)' + 'off' + '(\\s|$)'))){   //off
            _sel.className += ' '+ 'off';
        }
        _sel.childNodes[1].innerHTML = '售罄';  //售罄
        _sel.childNodes[1].style.marginTop = '-.2rem';
        _sel.childNodes[2].innerHTML = '¥'+price;//    添加价格price
    }

    //  调用函数
    sellOut("[data-time='2016-10-16']",1990);
    sellOut("[data-time='2016-11-20']",1990);
    sellOut("[data-time='2016-12-15']",1990);

    /**
     * @sellHot   正在热卖中。。。。。
     */
    function sellHot(sel,price){
        var _sel = document.querySelector(sel);
        // if(!_sel.className.match(new RegExp('(\\s|^)' + 'on' + '(\\s|$)'))){   //off
        //     _sel.className += ' '+ 'on';
        // }
        _sel.classList.add('on');
        _sel.childNodes[2].innerHTML = '¥'+price;//    添加价格price
        _sel.childNodes[2].style.marginTop = '-.25rem';
    }

    //  调用函数
    sellHot("[data-time='2016-10-08']",1900);
    sellHot("[data-time='2016-10-28']",2000);
    sellHot("[data-time='2016-11-08']",2000);
    sellHot("[data-time='2016-10-29']",2000);
    sellHot("[data-time='2016-10-30']",2000);

    /**
     * 有团期的价格可以点击
     */
    function clickNow(){
        var _dayList = document.getElementsByClassName('day-list'),
            _on = document.getElementsByClassName('on');
        for(var i=0,len=_on.length;i<len;i++){
            _on[i].index = i;
            _on[i].onclick = function(){
                for(var i=0;i<_on.length;i++){
                    // if(_on[i].className.match(new RegExp('(\\s|^)' + 'cur' + '(\\s|$)'))){
                    //     _on[i].className = _on[i].className.replace(new RegExp('(\\s|^)' + 'cur' + '(\\s|$)'), '');
                    // }
                    _on[i].classList.remove('cur'); //----提示：方法2
                }
                // if(!_on[this.index].className.match(new RegExp('(\\s|^)' + 'cur' + '(\\s|$)'))){ //
                //     _on[this.index].className += ' '+ 'cur';
                // }
                _on[this.index].classList.add('cur');//----提示：方法2
            };
        }

    }
    clickNow();


    /***
     * @CreateCalendar 构造函数，统筹日历
     */
    var CreateCalendar = {
        create:function(){
            'use strict';
            var CreateCalendar ={
                init:function(){    //  初始化函数
                    // to do ...
                    this.changeTitle();
                    this.addWeekColor();
                    this.getDateCur();
                    this.addOrdel('num1','num2','num3','hover','sure');
                },
                addWeekColor:function(){  //    周六日 title
                    var _weekList = document.getElementsByClassName('week-list')[0],
                        _li = _weekList.getElementsByTagName('li'),_len=_li.length;
                    _li[0].style.color = 'red';
                    _li[_len - 1].style.color = 'red';
                },
                getDateCur:function(){  //  添加“今天，明天，后天”
                    var GetDateStr = function(){
                        var _dd = new Date();
                        _dd.setDate(_dd.getDate()); //  获取
                        var _y = _dd.getFullYear(),_m=_dd.getMonth()+1,_d = _dd.getDate();
                        return _y + '-' + _m +'-' +_d;
                    };
                    var _cBox =document.getElementsByClassName('box-center')[0],
                        _calendars = document.getElementsByClassName('calendar-box'),
                        _cLens = _calendars.length,
                        _ul = document.getElementsByClassName('day-list');

                    for(var i=0;i<_ul.length;i++){
                        var _li = _ul[i].childNodes;
                        for(var j=0;j<_li.length;j++){
                            _li[j].setAttribute('data-index',j);
                            var _date = _li[j].getAttribute('data-time');
                            if(_date == GetDateStr(0)){
                                console.log('今天是：'+_li[j].getAttribute('data-time'));
                                if(!_li[j].className.match(new RegExp('(\\s|^)' + 'now' + '(\\s|$)'))){ //今天添加now
                                    _li[j].className += ' '+ 'now';
                                }
                                if(_li[j].className.match(new RegExp('(\\s|^)' + 'off' + '(\\s|$)'))){
                                    _li[j].className = _li[j].className.replace(new RegExp('(\\s|^)' + 'off' + '(\\s|$)'), '');
                                }
                            }
                        }
                    }
                    /**
                     * @_nowset class为now的日期转化为时间戳
                     * @_dataset    获得所有日期转化为时间戳
                     * @_dataset 与 _nowset  进行对比，小于_nowset的禁止用户点击 
                     */
                    var _nowset = Date.parse(new Date(document.getElementsByClassName('now')[0].dataset.time)) / 1000;  //  
                    console.log('今天时间戳：'+_nowset);

                    for(var i=0;i<_ul.length;i++){
                        // _ul[i].index = i;
                        var _li = _ul[i].childNodes;
                        for(var j=0;j<_li.length;j++){                
                            var _dateset = Date.parse(new Date(_li[j].dataset.time)) / 1000;
                            if(_li[j].dataset.time){
                                // var _less = _li[j].dataset.time;
                                if(_dateset < _nowset){
                                    _li[j].classList.add('off');
                                    // if(!_li[j].className.match(new RegExp('(\\s|^)' + 'over' + '(\\s|$)'))){ //今天添加now
                                    //     _li[j].className += ' '+ 'over';
                                    // }
                                    _li[j].classList.add('over');   //今天之前的日期
                                    _li[j].onclick = function(){
                                        return false;
                                    };
                                }
                            }

                        }
                    }

                    var _now = document.getElementsByClassName('now')[0];
                    _now.childNodes[0].innerHTML = '今天';

                },
                changeTitle:function(){ //点击切换左右按钮
                    var _switchBtn = document.getElementsByClassName('switch-btn')[0],
                        _left = _switchBtn.getElementsByClassName('left')[0],
                        _right = _switchBtn.getElementsByClassName('right')[0];
                    _left.onclick = function(){     //点击左侧月份按钮
                        swiper.prev();
                        
                        setTimeout(function(){
                            changeMonth();
                        },500);
                    };
                    _right.onclick = function(){    //点击右侧月份按钮
                        swiper.next();
                        setTimeout(function(){
                            changeMonth();
                        },500);
                    };
                },
                addOrdel:function(num1,num2,num3,hovers,sures){    //人数计算
                    //
                    var _surplus = 1,
                        _allNums = 10;  //总共人数-----后台传入

                    var _num3 = document.getElementsByClassName(num3),
                        _num2 = document.getElementsByClassName(num2),
                        _num1 = document.getElementsByClassName(num1);

                    for(var i=0;i<_num3.length;i++){
                        !(function(i){
                            _num3[i].onclick = function(){
                                var _japan = 0;
                                for(var j=0;j<_num2.length;j++){
                                    _japan += parseInt(_num2[j].innerHTML);
                                }
                                _surplus  = _allNums - _japan;
                                var _val = parseInt(_num2[i].innerHTML);
                                if(_surplus > 0){                        
                                    var _ands = _val + 1;
                                    _num2[i].innerHTML = _ands;
                                    for(var m=0;m<_num1.length;m++){
                                        _num1[m].classList.remove(hovers);
                                    }
                                    for(var m=0;m<_num3.length;m++){
                                        _num3[m].classList.remove(hovers);
                                    }
                                    _num3[i].classList.add(hovers);
                                    _num1[i].classList.add(sures);
                                    if(_surplus == 1){
                                        for(var m=0;m<_num3.length;m++){
                                            _num3[m].classList.remove(hovers);
                                            _num3[m].classList.remove(sures);
                                        }
                                    }

                                }else{
                                    for(var m=0;m<_num3.length;m++){
                                        _num3[i].classList.remove(hovers);
                                        _num3[i].classList.remove(sures);
                                    }
                                }
                            };
                        })(i);
                    }

                    for(var i=0;i<_num1.length;i++){
                        !(function(i){
                            _num1[i].onclick = function(){
                                if(_num1[i].classList.contains(sures)){
                                    for(var j=0;j<_num3.length;j++){
                                        _num3[j].classList.add(sures);
                                    }
                                    var _val = _num2[i].innerHTML;

                                    if(!(parseInt(_val) <= 1) ){
                                        var _adds = _val-1;
                                        _num2[i].innerHTML = _adds;
                                        for(var m=0;m<_num1.length;m++){
                                            _num1[m].classList.remove(hovers);
                                        }
                                        for(var m=0;m<_num3.length;m++){
                                            _num3[m].classList.remove(hovers);
                                        }
                                        _num1[i].classList.add(hovers);
                                    }else{
                                        _num1[i].classList.remove(hovers);
                                        _num1[i].classList.remove(sures);
                                        _num2[i].innerHTML = '0';
                                    }

                                }
                            };
                        })(i);
                    }



                }
            };
            return CreateCalendar;
        }
    };

    var myCalendar = CreateCalendar.create();
    myCalendar.init();
    

    var swiper = new Swiper({
        direction: 'horizontal',
        container: '.swiper',
        item: '.item',
        item_width: 'auto',
        threshold: 10
    });
    swiper.on('swiped', function(prev, current){
        changeMonth();
    });

    /**
     * @$boxCenters 动态修改calendar-box的width
     */
    var $boxCenters = document.getElementsByClassName('calendar-box'),
        $boxLens = $boxCenters.length;
    for(var i=0;i<$boxLens;i++){
        $boxCenters[i].style.width = (100/$boxLens) + '%';
    }

    /**
     *@changeMonth  函数作用是当日期发生改变的时候 title提示月份 中间和左右随之改变
     */

    function changeMonth(){
        //  中间部分发生变化
        var _swiper = document.getElementsByClassName('item'),
            _dayList = document.getElementsByClassName('day-list')[0];

        var _left = document.getElementsByClassName('switch-btn')[0].getElementsByClassName('left')[0],
            _right = document.getElementsByClassName('switch-btn')[0].getElementsByClassName('right')[0];

        var _myCur = document.querySelector('.active'),
            _li = _myCur.getElementsByTagName('li'); 

        if(_li[0].classList.contains('new')){
            var _new = _myCur.querySelectorAll('.new');
            var _curDay = _new[_new.length -1].nextSibling.getAttribute('data-time'),
                _ary = _curDay.split('-'),
                _month = document.getElementsByClassName('switch-btn')[0].getElementsByClassName('center')[0].getElementsByClassName('month')[0],
                _year = _month.nextElementSibling;
            _month.innerHTML = _ary[1];
            _year.lastElementChild.innerHTML = _ary[0];               
        }else{
            var _curDay = _li[0].getAttribute('data-time'),
                _ary = _curDay.split('-'),
                _month = document.getElementsByClassName('switch-btn')[0].getElementsByClassName('center')[0].getElementsByClassName('month')[0],
                _year = _month.nextElementSibling;
            _month.innerHTML = _ary[1];
            _year.lastElementChild.innerHTML = _ary[0];         
        }

        // 左侧发生变化
        var _prevSibling = _myCur.previousElementSibling;        
        if(_swiper[0].classList.contains('active')){
            _left.innerHTML = '';
        }else{
            if(_prevSibling){   //  如果前一个元素存在的话
                if(_prevSibling.childNodes[0].childNodes[0].classList.contains('new')){
                    var _new = _prevSibling.querySelectorAll('.new'),
                        _lastDay = _new[_new.length -1].nextSibling.getAttribute('data-time'),
                        _lastAry = _lastDay.split('-');
                    _left.innerHTML = _lastAry[1] + '月'; 
                }else{
                    var _lastDay = _prevSibling.childNodes[0].childNodes[0].getAttribute('data-time'),
                        _lastAry = _lastDay.split('-');
                    _left.innerHTML = _lastAry[1] + '月';
                }
            }
        }

        //  右侧发生变化
        var _nextSibling = _myCur.nextElementSibling;
        if(_swiper[_swiper.length - 1].classList.contains('active')){
            _right.innerHTML ='';
        }else{
            if(_nextSibling){   //  如果后一个元素存在的话
                if(_nextSibling.childNodes[0].childNodes[0].classList.contains('new')){
                    var _new = _nextSibling.querySelectorAll('.new'),
                        _newDay = _new[_new.length - 1].nextSibling.getAttribute('data-time'),
                        _newAry = _newDay.split('-');
                    _right.innerHTML = _newAry[1] + '月';
                }else{
                    var _newDay = _nextSibling.childNodes[0].childNodes[0].getAttribute('data-time'),
                        _newAry = _newDay.split('-');
                    _right.innerHTML = _newAry[1] + '月';
                }
            }
        }

    }
    changeMonth();
})(window);





