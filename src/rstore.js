module.exports = {
    _host: process.env.NODE_ENV === 'production' ? 'https://api.rijet.ru' : 'http://192.168.1.25:3003',
    _endpointAPI: '/api/v1',
    nomenclature: {},
    init: async function (organizationId, options) {
        
        if (!window.jQuery) await import( /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/jquery@3.5.1/dist/jquery.min.js');
        await import( /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/vue@2.6.12');
        await import( /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/tua-body-scroll-lock');
        await import( /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/npm/imask@6.0.5/dist/imask.min.js');
        await import( /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/gh/Shenor/cartography_api@master/jquery.fias.min.js');
        await import( /* webpackIgnore: true */ 'https://cdn.jsdelivr.net/gh/Shenor/luxon@main/dist/luxon.min.js'); //Luxon for dynamicaly import ES6
        
        // Rebind this for Vue instace **Fix** //
        const that = this;
        // Rest Function Work with time //
        const {DateTime, Interval} = luxon.default;
        const {lock, unlock} = bodyScrollLock;


        this.nomenclature = await this.getNomenclature(organizationId);
        this._loadCSS();
        
        const resStopList = await (await fetch(`${this._host}${this._endpointAPI}/getStopList/${organizationId}`)).json();
        const stopList = resStopList[0]?.items ?? []; // Обработка ошибки пустого листа
        // console.log(stopList)
/** _____________________________________________________________________________________________  */

        const idCategories = this.nomenclature.productCategories.map(({id}) => id);
        const inputFilter = function (textbox, inputFilter) {
            ["input", "keydown", "keyup", "mousedown", "mouseup", "select", "contextmenu", "drop"].forEach(function (event) {
                textbox.addEventListener(event, function () {
                    if (inputFilter(this.value)) {
                        this.oldValue = this.value;
                        this.oldSelectionStart = this.selectionStart;
                        this.oldSelectionEnd = this.selectionEnd;
                    } else if (this.hasOwnProperty("oldValue")) {
                        this.value = this.oldValue;
                        this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
                    } else {
                        this.value = "";
                    }
                });
            });
        };

        // Template Vue Module //
        const orderListItem = `
            <script type="text/x-template" id="rstoreOrderListItem">
                <div class="restore-order-item" id="">
                    <img class="restore-order-item-product-image" :src="getImageURL"></img>
                    <div class="restore-order-item-product-name">{{item.name}}</div>
                    <div class="restore-order-item-counter">
                        <button class="restore-order-item-counter__btn-minus" @click="sub">-</button>
                        <input class="restore-order-item-counter__input-count" type="text" 
                            :value="this.item.count" @click="onClickInput($event.target)" @blur="changeCount($event.target.value)">
                        <button class="restore-order-item-counter__btn-plus" @click="add">+</button>
                    </div>
                    <div class="restore-order-item-price" data-price="">{{totalPrice}} руб.</div>
                    <button class="restore-order-item__btn-remove" @click="del">×</button>
                </div>
            </script>
        `;
        const cardProduct = `
            <script type="text/x-template" id="rstoreCardProduct">
                <div class="restore__card">
                    <div class="restore__card-image">
                        <img :src="getImageURL">
                    </div>
                    <div class="restore__card-info">
                        <div class="restore__card-title">{{item.name}}</div>
                        <div class="restore__card-description">
                           {{item.description}}
                           <div v-if="options.isWeight && options.isСPFС && item.weight && item.energyFullAmounth" class="restore__card-gramms">{{getWeightProduct}} гр. / {{item.energyFullAmounth}} ККал</div>
                           <div v-else-if="options.isWeight && item.weight" class="restore__card-gramms">{{getWeightProduct}} гр.</div>
                           <div v-else-if="options.isСPFС && item.energyFullAmounth" class="restore__card-gramms">{{item.energyFullAmounth}} гр.</div>
                           
                        </div>
                        <div class="restore__card-price">{{item.price}} {{ options.textPriceCard ? options.textPriceCard : 'р.' }}</div>
                        <div class="restore__card-counter-wrapper">
                            <a class="restore__card__btn-action"  @click="addToCart">{{options.textButtonCard ? options.textButtonCard : 'Купить'}}</a>
                        </div>
                    </div>
                </div>
            </script>
        `
        const cartEmpty = `
            <script type="text/x-template" id="rstoreCartEmpty">
                <div class="restore-order restore-cart-empty" v-if="showModal==='empty'">
                    <div class="restore-order__header">
                        <span class="restore-order__header-title">Корзина</span>
                        <button class="restore-order__header-btn-close" @click="$emit('close')">×</button>
                    </div>
                    <div class="restore-order__body">
                        <div class="restore-order__form-empty">
                            <div class="restore-order__form-empty-title">Ваша корзина заказов пуста!</div>
                            <object :data="cartIcon" type="image/svg+xml" class="restore-order__form-empty-icon"></object>
                        </div>
                    </div>
                    <div class="restore-order__footer">
                        <button class="restore-order__footer-btn restore-order__footer-btn-back" @click="$emit('close')">Вернуться</button>
                    </div>
                </div>
            </script>
        `
        const cartSuccessOrder = `
            <script type="text/x-template" id="rstoreCartSuccessOrder">
                <div class="restore-order restore-order-success" v-if="showModal==='success'">
                    <div class="restore-order__header">
                        <span class="restore-order__header-title">Статус Заказа</span>
                        <button class="restore-order__header-btn-close" @click="$emit('close')">×</button>
                    </div>
                    <div class="restore-order__body">
                        <div class="restore-order__form-success">
                            <div class="restore-order__form-success-title"> Спасибо за заказ </div>
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox = "0 0 80 80" class="restore-order__form-success-icon">
                                <path fill="#bae0bd" d="M40,77.5C19.3,77.5,2.5,60.7,2.5,40S19.3,2.5,40,2.5S77.5,19.3,77.5,40S60.7,77.5,40,77.5z" />
                                <path fill="#5e9c76"
                                    d="M40,3c20.4,0,37,16.6,37,37S60.4,77,40,77S3,60.4,3,40S19.6,3,40,3 M40,2C19,2,2,19,2,40s17,38,38,38 s38-17,38-38S61,2,40,2L40,2z" />
                                <path fill="#fff" d="M34 56L20.2 42.2 24.5 38 34 47.6 58.2 23.4 62.5 27.6z" />
                            </svg>
                            <div class="restore-order__form-success-description rstore-succes-info">
                                <div>Ваш заказ принят в обработку</div>
                                <div v-if="successPayment">
                                    Номер заказа: {{successPayment.number}} <br>
                                    Время заказа: {{successPayment.createdTime}}
                                </div>
                                <div>В ближайшее время с вами свяжутся для уточнения деталей и подтвержения заказа</div>
                                <div v-if="options.phone">
                                    Если после оплаты заказа у Вас вознили технические проблемы или Вы обнаружили ошибку (ФИО/адрес/номер и д.р), 
                                    обратитесь по номеру {{options.phone}}
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="restore-order__footer">
                        <button class="restore-order__footer-btn restore-order__footer-btn-back" @click="onClose">Вернуться к покупкам</button>
                    </div>
                </div>
            </script>
        `
        const cart = `
        <div class="rstore-wrapper">
            <div class="restore-cart-wrapper" @click="openModal">
                <div class="restore-icon-wrapper">
                    <svg style = "stroke:#0d6654;" xmlns = "http://www.w3.org/2000/svg" viewBox = "0 0 64 64" width = "35px" height = "35px" >
                        <path fill="none" stroke-width="2" stroke-miterlimit="10" d="M44 18h10v45H10V18h10z"></path>
                        <path fill="none" stroke-width="2" stroke-miterlimit="10" d="M22 24V11c0-5.523 4.477-10 10-10s10 4.477 10 10v13">
                        </path>
                    </svg>
                </div>
                <div v-if="getItemCountAll" class="restore-cart-counter">{{getItemCountAll}}</div>
            </div>

            <transition name="slide">
                <div v-if="showAlertiWorkTime" class="restore__alert restore__alert--info">Уважаемые гости! Время работы заведения с {{workTime.timeFrom}} до {{workTime.timeTo}}</div>
            </transition>

            <div class="restore-order-wrapper" v-show="showModal">
                
                <cart-empty
                    :show-modal="showModal"
                    :options="options"
                    @close="closeCart"></cart-empty>

                <cart-success-order
                    :show-modal="showModal"
                    :options="options"
                    :success-payment="successPayment"
                    @close="closeCart"></cart-success-order>

                <div class="restore-order restore-order-registration" v-show="showModal==='fill'">
                    <div class="restore-order__header">
                        <span class="restore-order__header-title">Оформление заказа</span>
                        <button class="restore-order__header-btn-close" @click="closeCart">×</button>
                    </div>
                    <div class="restore-order__body">
                        <div class="restore-order__list">
                        <!-- -->
                            <otder-item 
                                v-for="item in cartData" 
                                :item="item" 
                                :key="item.key" 
                                @change-item="changeItemCart"
                                @delete-item="deleteItemCart"></otder-item>
                        <!-- -->
                        </div>
                        <div class="restore-order__form">
                            <div class="restore-order__form-row">
                                <div class="restore-order__form-input-wrapper--static">
                                    <input class="restore-order__form-input" :class="name.error?'restore-order__form-input--isError':''" type="text" id="restore-order__name-input" name="name" mainlength="3" maxlength="20" v-model="name.value" @input="isValidationName" required>
                                    <label class="restore-order__form-label">Ваше имя</label>
                                </div>
                                <div class="restore-order__form-input-wrapper--flexsible">
                                    <div>
                                        <input class="restore-order__form-input" :class="phone.error?'restore-order__form-input--isError':''" type="text" ref="restorePhone" id="restore-order__phone-input" title="На этот номер мы отправим SMS с информацией о заказе" maxlength="16" name="phone" v-model="phone.value" @input="isValidationPhone" @blur="primeHill" required>
                                        <label class="restore-order__form-label">Ваш номер</label>
                                    </div>
                                    <div>
                                        <input class="restore-order__form-input" :class="email.error?'restore-order__form-input--isError':''" type="text" title="На этот e-mail после оплаты мы отправим чек" name="email" v-model="email.value" @input="isValidationEmail" required>
                                        <label class="restore-order__form-label">Ваш e-mail</label>
                                    </div>
                                </div>
                                <!-- PrimeHill Block -->
                                    <transition name="fade">
                                        <div v-if="clientPrimeHill.firstName" class="restore-order__form-success">
                                            Здравствуйте, {{clientPrimeHill.firstName}}!
                                            Спасибо, что используете нашу дисконтную систему,
                                            ваша скидка составляет {{clientPrimeHill.discount}}%.
                                        </div>
                                        <div v-if="clientPrimeHill.error" class="restore-order__form-info">
                                            Здравствуйте, хотите получать скидки и бонусы за покупки? <a :href="options.primeHill" target="_blank">Зарегистрируйтесь</a> в нашей системе лояльности. 
                                            После регистрации перезагрузите страницу для применения скидки
                                        </div> 
                                    </transition>
                                <!--  -->
                                <!-- Error Block -->
                                    <transition name="fade">
                                        <div v-if="errorCustomer" class="restore-order__form-warning">{{errorCustomer}}</div>
                                    </transition>
                                <!--  -->
                                <div class="restore-order__form-input-wrapper--flexsible">
                                    <div>
                                        <div class="restore-order__form-client-caption">
                                            Способ оплаты
                                        </div>
                                        <div v-if="options.methodPayment" class="restore-order__form-radio-group">
                                            <div v-for="(item, idx) in options.methodPayment" :key="item.key">
                                                <input type="radio" :id="'payment-' + item.toLowerCase()" name="payment-type" v-model="payment" :value="item">
                                                <label :for="'payment-' + item.toLowerCase()">{{methodPayment.get(item)}}</label>
                                            </div>
                                        </div>
                                        <div v-else class="restore-order__form-radio-group">
                                            <div>
                                                <input type="radio" id="payment-cash" name="payment-type" v-model="payment" value="CASH">
                                                <label for="payment-cash">Наличными</label>
                                            </div>
                                            <div>
                                                <input type="radio" id="payment-card" name="payment-type" v-model="payment" value="CARD">
                                                <label for="payment-card">Банковской картой</label>
                                            </div>
                                            <div>
                                                <input type="radio" id="payment-card1" name="payment-type" v-model="payment" value="CARD1">
                                                <label for="payment-card1">Картой при получении</label>
                                            </div>
                                        </div>
                                    </div>
                                    <div>
                                        <div class="restore-order__form-client-caption">
                                            Способ получения
                                        </div>
                                        <div class="restore-order__form-method-delivery">
                                            <label :class="['restore-order__form-method-delivery-item', isSelfService ? '' : 'restore-order__form-method-delivery-item--active']">
                                                <input name="method" type="radio" v-model="isSelfService" :value="false"> Доставка
                                            </label>
                                            <label :class="['restore-order__form-method-delivery-item', isSelfService ? 'restore-order__form-method-delivery-item--active' : '']">
                                                <input name="method" type="radio" v-model="isSelfService" :value="true"> Самовывоз
                                            </label>
                                        </div>
                                    </div>
                                </div>
                                <transition name="fadeHeight">
                                <div v-show="!isSelfService">
                                    <div class="restore-order__form-client-caption">
                                        Адрес получателя
                                    </div>
                                    <!-- Error Block -->
                                        <transition name="fade">
                                            <div v-if="errorAdress" class="restore-order__form-warning">{{errorAdress}}</div>
                                        </transition>
                                    <!--  -->
                                    <div class="restore-order__form-input-wrapper--static">
                                        <input class="restore-order__form-input" :class="city.error?'restore-order__form-input--isError':''" type="text" id="restore-order__city-input"  name="city" v-model="city.value" @input="isValidataionCity" required>
                                        <label class="restore-order__form-label">Ваш город</label>  
                                    </div>
                                    <div class="restore-order__form-input-wrapper--static">
                                        <input class="restore-order__form-input" type="text" :class="street.error?'restore-order__form-input--isError':''" id="restore-order__street-input"  name="streer" v-model="street.value" @input="isValidataionStreet" required>
                                        <label class="restore-order__form-label">Ваша улица</label>  
                                    </div>
                                    <div class="restore-order__form-input-wrapper">
                                        <div>
                                            <input class="restore-order__form-input" type="text" :class="home.error?'restore-order__form-input--isError':''" id="restore-order__home-input" name="home" maxlength="10" v-model="home.value" @input="isValidataionHome" required>
                                            <label class="restore-order__form-label">Дом</label>
                                        </div>
                                        <div>
                                            <input class="restore-order__form-input" :class="home.error?'restore-order__form-input--isError':''" type="text" id="restore-order__apartment-input"  name="apartment" maxlength="4" v-model="apartment.value" required> 
                                            <label class="restore-order__form-label">Квартира</label>
                                        </div>
                                    </div>
                                    <div class="restore-order__comment">
                                        <textarea v-if="!isCommentShow" class="restore-order__comment-value" maxlength="100" rows="2" v-model="comment" placeholder="Комментарий"></textarea>
                                    </div>
                                </div>
                                </transition>
                            </div>  
                        </div>
                        <div class="restore-order__total-sum-wrapper">
                            <div class="restore-order__totalamounth-info">
                                <div class="restore-order__totalamounth__sum-product-info">
                                    <span>Итого:</span>
                                    <span class="restore-order__totalamounth__sum-product">
                                        <span :class="clientPrimeHill.discount ? 'rstore__text-crossed':''">{{formatCurrency(getTotalSum)}}</span> 
                                        <span v-if="clientPrimeHill.discount">{{formatCurrency(getTotalSumWithDiscount)}}</span>
                                    </span>
                                </div>
                                <div v-if="!isSelfService && deliveryPrice" class="restore-order__totalamounth__sum-delivery-info">
                                    <span>Доставка:</span>
                                    <span class="restore-order__totalamounth__delivery-price">{{formatCurrency(deliveryPrice)}}</span>
                                </div>
                            </div>
                            <div class="restore-order__totalamounth">
                                <span class="restore-order__totalamounth__title">Итоговая сумма: </span>
                                <span class="restore-order__totalamounth__total-sum">{{formatCurrency(getTotalSumWithDelivery)}}</span>
                            </div>
                            <div v-if="options.publicOffer || options.privacyPolicy">
                                <div v-if="options.publicOffer && options.privacyPolicy" class="restore-order__text-offer">
                                *Нажимая кнопку 'Заказать' вы соглашаетесь с <a v-if="options.privacyPolicy" :href="options.privacyPolicy" target="_blank">политикой конфиденциальности</a> 
                                и <a v-if="options.publicOffer" :href="options.publicOffer" target="_blank">публичной офертой</a>
                                </div>
                                <div v-else class="restore-order__text-offer">
                                *Нажимая кнопку 'Заказать' вы соглашаетесь с <a v-if="options.privacyPolicy" :href="options.privacyPolicy" target="_blank">политикой конфиденциальности</a>
                                <a v-if="options.publicOffer" :href="options.publicOffer" target="_blank">публичной офертой</a></div>
                            </div>
                        </div>
                        <!-- Error Block -->
                            <transition name="fade">
                                <div v-if="checkAllFields" style="padding: 10px 15px;">
                                    <div class="restore-order__form-warning">
                                        <div>{{errorSend.name}}</div>
                                        <div>{{errorSend.phone}}</div>
                                        <div>{{errorSend.email}}</div>
                                        <div>{{errorSend.city}}</div>
                                        <div>{{errorSend.street}}</div>
                                        <div>{{errorSend.home}}</div>
                                        <div>{{errorSend.apartment}}</div>
                                    </div>
                                </div>
                            </transition>
                        <!--  -->
                        <!-- Warning work time Block -->
                            <transition name="fade">
                                <div v-if="!isWorkTime" style="padding: 15px 15px; font-size: 1rem;">
                                    <div class="restore-order__form-info">Время работы заведения с {{workTime.timeFrom}} до {{workTime.timeTo}}</div>
                                </div>
                            </transition>
                        <!--  -->     
                    </div>
                    <div class="restore-order__footer">
                        <button class="restore-order__footer-btn restore-order__footer-btn-back" @click="closeCart">Вернуться</button>
                        <button type="submit" class="restore-order__footer-btn restore-order__footer-btn-order"
                            :class="{'spinner': isSendingOrder, 'restore-order__footer-btn-order--isDisabled': !isWorkTime}" 
                            @click="sendOrder">Заказать</button>
                    </div>
                </div>
                <div id="payment-form"></div>
            </div>
        </div>
        `;
        const catalog = `
            <card-product
                v-for="item in products"
                :key="item.id"
                :item="item"
            ></card-product>
        `;
       
        document.body.insertAdjacentHTML("beforeend", cart);
        document.body.insertAdjacentHTML("beforeend", cartEmpty);
        document.body.insertAdjacentHTML("beforeend", cardProduct);
        document.body.insertAdjacentHTML("beforeend", orderListItem);
        document.body.insertAdjacentHTML("beforeend", cartSuccessOrder);

        // Global event Hub //
        const $eventHub = new Vue()

        // Register component //
        Vue.component("otder-item", {
            data() {
                return {}
            },
            props: ['item'],
            computed: {
                totalPrice() {
                    return this.item.price * this.item.count;
                },
                getImageURL() {
                    return this.item.images[this.item.images.length - 1] ? this.item.images[this.item.images.length - 1].imageUrl : 'https://via.placeholder.com/50'
                }
            },
            methods: {
                onClickInput(target){
                    inputFilter(target, (value) => {
                        return /^\d*$/.test(value) && (value === "" || parseInt(value) <= 100);
                    });
                },
                changeCount(value){
                    //? Так как свойство при не заполнения поля не меняется и остается равным 1//
                    //? Vue не регистрирует изменения, отрисовки не происходит и приходится заново рендерить поле,//
                    //?  что бы, оно не остовалось пустым! //
                    if (!value || value == 0) return this.$forceUpdate()
                    this.$emit('change-item', {
                        id: this.item.id,
                        count: value
                    });
                },
                sub() {
                    if (this.item.count <= 1) return this.del()
                    this.$emit('change-item', {
                        id: this.item.id,
                        count: --this.item.count
                    });
                },
                add() {
                    if (this.item.count >= 99) return
                    this.$emit('change-item', {
                        id: this.item.id,
                        count: ++this.item.count
                    });
                },
                del() {
                    this.$emit('delete-item', this.item.id);
                }
            },
            template: "#rstoreOrderListItem"
        });
        Vue.component("card-product", {
            data() {
                return{
                    options: options ?? {},
                    isWarningMessage: false,
                    newItem: {...this.item, count: 1}
                }
            },
            props: ['item'],
            methods:{
                addToCart(){
                    if (!rstoreCart.isWorkTime) return $eventHub.$emit('not-work-time')
                    let oldItem = rstoreCart.cartData.filter(itemCart => this.item.id == itemCart.id)[0];
                    if (!oldItem) rstoreCart.cartData.push(this.newItem)
                    else oldItem.count++
                    rstoreCart.saveCartData()
                }
            },
            computed:{
                getWeightProduct() {
                    return `${Math.floor(this.item.weight * 1000)}`
                },
                getImageURL(){
                    return this.item.images[this.item.images.length - 1] ? this.item.images[this.item.images.length - 1].imageUrl : 'https://via.placeholder.com/250'
                }
            },
            template: "#rstoreCardProduct"
        })
        Vue.component("cart-empty", {
            data(){
                return{}
            },
            props: ['showModal', 'options'],
            method: {},
            computed: {
                cartIcon(){
                    if (this.options && this.options.cartIcon) {
                        return this.options.cartIcon
                    } else {
                        return `${that._host}/assets/default.svg`
                    }
                }
            },
            template: '#rstoreCartEmpty'
        })   
        Vue.component("cart-success-order", {
            data(){
                return{}
            },
            props: ['showModal', 'options', 'successPayment'],
            methods: {
                onClose() {
                    rstoreCart.cartData = [];
                    localStorage.removeItem('cart');
                    localStorage.removeItem('createdOrderIiko');
                    this.$emit('close')
                }
            },
            computed: {},
            template: '#rstoreCartSuccessOrder'
        })   

        // Create & Render Catalog //
        idCategories.forEach(id => {
            const contentCategoties = document.querySelector(`[id='${ id }']`);
            const contentCategotiesClickable = document.querySelector(`[data-id='${ id }']`);

            if (!contentCategoties) return;

            contentCategoties.classList.add('restore__main-content')
            const validProducts = this.nomenclature.products.filter(product => {
                if(stopList.filter(i => i.productId == product.id && i.balance == 0).length > 0) return;
                return product.productCategoryId == id
            });
            contentCategoties.insertAdjacentHTML('beforeend', catalog)
    
            new Vue({
                el: `[id='${ id }']`,
                data() {
                    return {
                        options: options,
                        products: validProducts
                    }
                }
            })
        })
        
        // Create & render Cart //
        var rstoreCart = new Vue({
            el: '.rstore-wrapper',
            data: {
                name: {
                    value: '',
                    required: false,
                    minLength: true,
                    error: false
                },
                email: {
                    value: '',
                    required: false,
                    minLength: true,
                    error: false
                },
                phone: {
                    value: '',
                    required: false,
                    minLength: true,
                    error: false
                },
                city: {
                    value: '',
                    required: false,
                    minLength: true,
                    error: false
                },
                street: {
                    value: '',
                    required: false,
                    minLength: true,
                    error: false
                },
                home: {
                    value: '',
                    required: false,
                    minLength: true,
                    error: false
                },
                apartment: {
                    value: '',
                    required: true,
                    minLength: true,
                    error: false
                },
                comment: '',
                cartData: [],
                clientPrimeHill: {
                    firstName: '',
                    lastName: '',
                    error: null,
                    discount: 0
                },
                successPayment: null,
                workTime: null,
                methodPayment: new Map()
                    .set('CASH', 'Наличные')
                    .set('CARD', 'Банковской картой')
                    .set('CARD1', 'Картой при получении'),
                payment: options?.methodPayment ? options.methodPayment[0] : 'CASH',
                deliveryPrice: options?.deliveryPrice ?? null,
                options: options ?? {},
                errorCustomer: '',
                errorAdress: '',
                errorSend: {
                    name: '',
                    phone: '',
                    email: '',
                    city: '',
                    street: '',
                    home: '',
                    apartment: ''
                },
                isCommentShow: false,
                isSelfService: false,
                showModal: false, //'success',
                showAlertiWorkTime: false,
                isLoading: false,
                isSendingOrder: false
            },
            created(){
                $eventHub.$on('not-work-time', this.showMessageWorkTime)
                const createdPaymentId = JSON.parse(localStorage.getItem('createdPaymentId'))
                // console.log(createdPaymentId)

                if (createdPaymentId) {
                    const eventSource = new EventSource(`${that._host}${that._endpointAPI}/eventPayment/${createdPaymentId}`);

                    eventSource.addEventListener('succeeded', (event) => {
                        console.log(JSON.parse(event.data))
                        this.showModal = "success";
                        this.successPayment = JSON.parse(event.data);
                        localStorage.setItem('createdOrderIiko', event.data);
                        eventSource.close()
                    });

                    eventSource.addEventListener('canceled', (event) => {
                        console.error("⛔ Order Payment failed: ", JSON.parse(event.data));
                        localStorage.removeItem('createdPaymentId');
                        eventSource.close()
                    });
                }
            },
            beforeDestroy(){
                $eventHub.$off('not-work-time')
            },
            mounted(){
                this.cartData = JSON.parse(localStorage.getItem('cart')) || [];
                this.successPayment = JSON.parse(localStorage.getItem('createdOrderIiko')) || null;
                this.getWorkTime();

                $('#restore-order__city-input').fias({
                    type: $.fias.type.city,
                    spinner: false,
                    verify: true,
                    check: (city) => {
                        if (!city) {
                            this.city.minLength = false
                            return this.errorAdress = 'Ошибка обработки: Данный город не найден!';
                        }
                        this.city.minLength = true
                        this.errorAdress = ''
                        this.errorSend.city = ''
                        this.city.value = city.name
                    },
                    change: (city) => {
                        if (!city) {
                            this.city.minLength = false
                            return this.errorAdress = 'Ошибка обработки: Данный город не найден!';
                        }
                        this.city.minLength = true
                        this.errorAdress = ''
                        this.errorSend.city = ''
                        this.city.value = city.name
                    }
                });

                $('#restore-order__street-input').fias({
                    type: $.fias.type.street,
                    parentType: $.fias.type.city,
                    parentInput: '#restore-order__city-input',
                    withParents: true,
                    spinner: false,
                    verify: true,
                    check: (street) => {
                        if(!street) {
                            this.street.minLength = false
                            return this.errorAdress = `Ошибка обработки: Данная улица не найдена в городе '${this.city.value}'!`
                        }
                        this.street.minLength = true
                        this.errorAdress = ''
                        this.errorSend.street = ''
                        this.street.value = street.name
                    },
                    change: (street) => {
                        if (!street) {
                            this.street.minLength = false
                            return this.errorAdress = `Ошибка обработки: Данная улица не найдена в городе '${this.city.value}'!`
                        }
                        this.street.minLength = true
                        this.errorAdress = ''
                        this.errorSend.street = ''
                        this.street.value = street.name
                    }
                });

                $('#restore-order__home-input').fias({
                    type: $.fias.type.building,
                    parentType: $.fias.type.street,
                    parentInput: '#restore-order__street-input',
                    withParents: true,
                    spinner: false
                });
            },
            watch:{
                cartData() {
                    this.saveCartData()
                },
                isSelfService(){
                    for (let key in this.errorSend){
                        this.errorSend[key] = ''
                    }
                },
                "name": {
                    handler: function (val) {
                        val.error = val.required && !val.minLength
                    },
                    deep: true
                },
                "phone": {
                    handler: function (val) {
                        val.error = val.required && !val.minLength
                    },
                    deep: true
                },
                "email": {
                    handler: function (val) {
                        val.error = val.required && !val.minLength
                    },
                    deep: true
                },
                "city": {
                    handler: function (val) {
                        val.error = val.required && !val.minLength
                    },
                    deep: true
                },
                "street": {
                    handler: function (val) {
                        val.error = val.required && !val.minLength
                    },
                    deep: true
                },
                "home": {
                    handler: function (val) {
                        val.error = val.required && !val.minLength
                    },
                    deep: true
                },
                "apartment": {
                    handler: function (val) {
                        val.error = val.required && !val.minLength
                    },
                    deep: true
                }
            },
            methods: {
                isValidationName() {
                    if(this.name.value != '') {
                        this.name.required = true
                        this.errorCustomer = ""
                    } else {
                        this.errorCustomer = "Поле 'Имя' является обязательным"
                        return;
                    }

                    if (this.name.value.length >= 3 && this.name.value.length <= 20) {
                        this.name.minLength = true
                        this.errorCustomer = ""
                        this.errorSend.name = ""
                    } else {
                        this.name.minLength = false
                        this.errorCustomer = "Поле 'Имя' должно состоять мининмум из 3-х символов"
                    }
                },
                isValidationPhone(){
                    if (this.$refs.restorePhone.value != '' && this.$refs.restorePhone.value != '+7') {
                        this.phone.required = true
                        this.errorCustomer = ""
                    } else {
                        this.errorCustomer = "Поле 'Номер' является обязательным"
                        return;
                    }

                    if (this.$refs.restorePhone.value.length == 16) {
                        this.phone.minLength = true
                        this.errorCustomer = ""
                        this.errorSend.phone = ""
                    } else {
                        this.phone.minLength = false
                        this.errorCustomer = "Поле 'Номер' заполнено некорректно"
                    }
                },
                isValidationEmail(){
                    const rex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,24}))$/;

                      if (this.email.value != '') {
                          this.email.required = true
                          this.errorCustomer = ""
                      } else {
                          this.errorCustomer = "Поле 'Email' является обязательным"
                          return;
                      }

                      if (rex.test(this.email.value)) {
                          this.email.minLength = true
                          this.errorCustomer = ""
                          this.errorSend.email = ""
                      } else {
                          this.email.minLength = false
                          this.errorCustomer = "Поле 'Email' заполнено некорректно"
                      }
                },
                isValidataionCity(){
                    if (this.city.value != '') {
                        this.city.required = true
                        this.errorSend.city = ""
                    } else {
                        this.errorSend.city = "Поле 'Город' является обязательным"
                        return;
                    }
                },
                isValidataionStreet() {
                    if (this.street.value != '') {
                        this.street.required = true
                        this.errorSend.street = ""
                    } else {
                        this.errorSend.street = "Поле 'Город' является обязательным"
                        return;
                    }
                },
                isValidataionHome(){
                    if (this.home.value != '') {
                        this.home.required = true
                        this.errorSend.home = ""
                    } else {
                        this.errorSend.home = "Поле 'Дом' является обязательным"
                        return;
                    }

                    if (this.home.value.length > 10) this.home.value = this.home.value.substring(0, 10)
                },
                showMessageWorkTime(){
                    if (this.showAlertiWorkTime == true) return;
                    this.showAlertiWorkTime = true
                    setTimeout(() => {this.showAlertiWorkTime = false}, 2000)
                },
                saveCartData(){
                    localStorage.setItem('cart', JSON.stringify(this.cartData));
                },
                changeItemCart({id, count}){
                    //? При изменение свойства count на тоже что и было (oldValue === newValue), //
                    //? то Vue не обновляет значение и watch не срабатывает //

                    let item = this.cartData.find(item => item.id == id)
                    item.count = parseInt(count)
                    this.saveCartData()
                    this.openModal()
                },
                deleteItemCart(id){
                    this.cartData = this.cartData.filter(item => item.id != id)
                    this.openModal()
                },
                formatCurrency(val) {
                    return new Intl.NumberFormat('ru-RU', {
                        style: 'currency',
                        currency: 'RUB'
                    }).format(val);
                },
                showComment(){
                    this.isCommentShow = !this.isCommentShow
                },
                openModal() {
                    lock(document.querySelector('.restore-order-wrapper'));
                    document.querySelector('body').style = 'overflow-y: hidden; height: 100%;';
                    document.querySelector('html').style = 'overflow-y: hidden;';
                    localStorage.getItem('createdOrderIiko')
                    if (localStorage.getItem('createdOrderIiko')) return this.showModal = 'success';
                    if (this.cartData.length) this.showModal='fill'
                    else this.showModal='empty'
                },
                closeCart() {
                    unlock(document.querySelector('.restore-order-wrapper'));
                    document.querySelector('body').style = 'overflow-y: unset; height: auto;';
                    document.querySelector('html').style = 'overflow-y: unset;';
                    this.showModal = false
                },
                isValidForm(){
                    if (this.name.error || !this.name.value) this.errorSend.name = "Заполните поле 'Имя'"
                    if (this.phone.error || !this.name.value) this.errorSend.phone = "Заполните поле 'Телефон'"
                    if (this.email.error || !this.email.value) this.errorSend.email = "Заполните поле 'Email'"
                    if (this.city.error || !this.city.value && !this.isSelfService) this.errorSend.city = "Заполните поле 'Город'"
                    if (this.street.error || !this.street.value && !this.isSelfService) this.errorSend.street = "Заполните поле 'Улица'"
                    if (this.home.error || !this.home.value && !this.isSelfService) this.errorSend.home = "Заполните поле 'Дом'"

                    return ((this.name.error || !this.name.value) || (this.phone.error || !this.phone.value)
                        || (this.email.error || !this.email.value) || (this.city.error || !this.city.value 
                        && !this.isSelfService) || (this.street.error || !this.street.value && !this.isSelfService) 
                        || (this.home.error || !this.home.value && !this.isSelfService)) ? false: true;
                    
                },
                async getWorkTime(){
                    try {
                        const res = await fetch(`${that._host}${that._endpointAPI}/getWorkTime/${organizationId}`);
                        const workTime = await res.json();
                        if (!workTime.timeFrom && !workTime.timeTo) return false
                        this.workTime = workTime
                    } catch (e) {
                        console.log(e)
                    }
                },
                async primeHill(){
                    if (!this.options.primeHill) return false;
                    if (this.phone.error || !this.phone.value) return false;

                    // this.isLoading = true
                    const res = await fetch(`${that._host}${that._endpointAPI}/prime-hill/${this.phone.value}`)
                    const clientPH = await res.json()
                    // this.isLoading = false
                    // console.log(this.isLoading)
                    // console.log(clientPH)
                    if(!clientPH.errorId){
                        this.clientPrimeHill.firstName = clientPH.firstName
                        this.clientPrimeHill.lastName = clientPH.lastName
                        this.clientPrimeHill.discount = parseInt(clientPH.discountPercent)
                    } else {
                        this.clientPrimeHill.firstName = ''
                        this.clientPrimeHill.lastName = ''
                        this.clientPrimeHill.discount = 0
                        this.clientPrimeHill.error = clientPH
                    }
                },
                async sendOrder(){
                    if (!this.isWorkTime) return false;
                    if (this.isSendingOrder) return false;
                    if (!this.isValidForm()) return console.log("Error")
                    console.log("Все поля заполнены")
                    this.isSendingOrder = true
                    
                    const order = {
                        cart: this.cartData,
                        orderPrice: this.getTotalSum,
                        discount: this.getDiscount,
                        deliveryPrice: this.deliveryPrice,
                        organizationID: organizationId,
                        name: this.name.value,
                        phone: this.phone.value,
                        email: this.email.value,
                        city: this.city.value,
                        street: this.street.value,   
                        home: this.home.value,
                        apartment: this.apartment.value,
                        isSelfService: this.isSelfService,
                        payment: this.payment,
                        comment: this.comment,
                        return_url: window.location.href
                    }

                    const res = await fetch(`${that._host}${that._endpointAPI}/order`, {
                        method: 'POST',
                        mode: 'cors',
                        headers: {
                            'Content-Type': 'application/json'
                        },
                        body: JSON.stringify(order)
                    });
                    const createdOrder = await res.json()
                    this.isSendingOrder = false
                    if (createdOrder.error) return console.log(createdOrder)
                    if (createdOrder.confirmation_url) {
                        localStorage.setItem('createdPaymentId', JSON.stringify(createdOrder.id));
                        window.location = createdOrder.confirmation_url
                        return;
                    }
                    this.showModal = "success";
                    this.successPayment = createdOrder;
                    localStorage.setItem('createdOrderIiko', JSON.stringify(createdOrder));
                    console.log(createdOrder)
                }
            },
            computed: {
                checkAllFields() {
                    if (this.isSelfService) return (this.errorSend.name || this.errorSend.phone || this.errorSend.email)
                    else return (this.errorSend.name || this.errorSend.phone || this.errorSend.email || this.errorSend.city 
                    || this.errorSend.street || this.errorSend.home || this.errorSend.apartment)
                },
                getItemCountAll(){
                    return this.cartData.reduce((count, prodCount) => {
                        return count + prodCount.count;
                    }, 0);
                },
                getDiscount(){
                   return this.getTotalSum / 100 * this.clientPrimeHill.discount;
                },
                getTotalSum(){
                    return this.cartData.reduce((sum, prodCount) => {
                        return sum + prodCount.count * prodCount.price;
                    }, 0);
                },
                getTotalSumWithDiscount(){
                    const sum = this.cartData.reduce((sum, prodCount) => {
                        return sum + prodCount.count * prodCount.price;
                    }, 0);
                    return sum - (sum / 100 * this.clientPrimeHill.discount);             
                },
                getTotalSumWithDelivery(){
                    let sum = this.cartData.reduce((sum, prodCount) => {
                        return sum + prodCount.count * prodCount.price;
                    }, 0);
                    if (this.clientPrimeHill.discount) sum = sum - (sum / 100 * this.clientPrimeHill.discount);
                    return !this.isSelfService ? sum + this.deliveryPrice : sum
                },
                isWorkTime(){
                    if(this.workTime === null) return true; 
                    if(!this.workTime) return; 
                    let now = DateTime.local()
                    let workTimeStart = DateTime.fromISO(this.workTime.timeFrom)
                    let workTimeEnd = DateTime.fromISO(this.workTime.timeTo)
                    if (workTimeStart.hour >= workTimeEnd.hour) workTimeEnd = workTimeEnd.plus({days: 1})
                    let interval = Interval.fromDateTimes(workTimeStart, workTimeEnd)

                    //console.log(workTimeStart.toString())
                    //console.log(workTimeEnd.toString())
                    return interval.contains(now);
                }
            }
        })

        new IMask(document.querySelector('#restore-order__phone-input'), {
            mask: '+{7}(000)000-00-00'
        });
/** _____________________________________________________________________________________________  */

        Object.freeze(rstore);
    },
    _loadCSS: async function () {
        document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${ this._host }/stylesheets/rstore.css">`);
        // document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${ this._host }/stylesheets/clients/default/card.css">`);
        document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="${ this._host }/stylesheets/clients/${this.getOrganizationID()}/card.css">`);
        document.head.insertAdjacentHTML('beforeend', `<link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/Shenor/cartography_api@master/jquery.fias.min.css">`);
        document.head.insertAdjacentHTML('beforeend', `<script defer src="https://cdn.jsdelivr.net/npm/vue@2.6.12"></script>`);
    },
    getNomenclature: async function (id) {
        try {
            const data = await fetch(`${this._host + this._endpointAPI}/nomenclature/`, {
                method: 'GET',
                headers: {
                    "Content-Type": "application/json",
                    "Organization": id
                }
            });
            return data.json();
        } catch (error) {
            throw new Error(error);
        }
    },
    getOrganizationID: function () {
        return this.nomenclature.organizationID;
    },
}