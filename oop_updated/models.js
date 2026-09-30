/* =========================================================
   models.js  -  คลาสทั้งหมดตาม Class Diagram
   ใช้แบบ <script src="models.js"></script> (ทำงานได้แม้เปิดไฟล์ตรง)
   คลาสทั้งหมดถูก export ไว้ที่ window.Models
   ========================================================= */

/* =========================================================
   1. Product (abstract)            -> Abstraction, Encapsulation
   ========================================================= */
class Product {
    #productId;
    #name;
    #price;
    #stock;
    #description;
    #meta; // ข้อมูลเสริมจากหน้าเว็บ เช่น รูป ผู้ขาย วิธีชำระเงิน

    constructor(productId, name, price, stock, description, meta = {}) {
        // Abstraction: ห้ามสร้าง object จากคลาสแม่โดยตรง
        if (new.target === Product) {
            throw new TypeError('Product เป็น abstract class สร้างตรงๆ ไม่ได้');
        }
        this.#productId = productId;
        this.name = name;               // ผ่าน setter (ตรวจสอบค่า)
        this.price = price;
        this.#stock = 0;
        this.stock = stock;
        this.#description = description || '';
        this.#meta = { ...meta };
    }

    /* ---------- getter / setter (Encapsulation) ---------- */
    get productId() { return this.#productId; }
    get name() { return this.#name; }
    set name(value) {
        if (!value || !String(value).trim()) {
            throw new Error('ชื่อสินค้าต้องไม่ว่าง');
        }
        this.#name = String(value).trim();
    }
    get price() { return this.#price; }
    set price(value) {
        const n = Number(value);
        if (!Number.isFinite(n) || n < 0) {
            throw new Error('ราคาต้องเป็นตัวเลขที่ไม่ติดลบ');
        }
        this.#price = n;
    }
    get stock() { return this.#stock; }
    set stock(value) {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 0) {
            throw new Error('จำนวนสต็อกต้องเป็นจำนวนเต็มที่ไม่ติดลบ');
        }
        this.#stock = n;
    }
    get description() { return this.#description; }
    get meta() { return { ...this.#meta }; }

    /* ---------- methods ตาม diagram ---------- */
    getDetails() {
        return `${this.#name} | ราคา ฿${this.#price} | คงเหลือ ${this.#stock} ชิ้น` +
            ` | ส่วนลด ฿${this.calculateDiscount()}`;
    }

    checkStock(qty) {
        return Number(qty) > 0 && this.#stock >= Number(qty);
    }

    updateStock(qty) {
        // qty เป็นบวก = เพิ่มสต็อก, ลบ = ตัดสต็อก
        const next = this.#stock + Number(qty);
        if (next < 0) {
            throw new Error('สต็อกไม่พอ');
        }
        this.#stock = next;
    }

    // abstract method: คลาสลูกต้อง override (Polymorphism)
    calculateDiscount() {
        throw new Error('คลาสลูกต้อง override calculateDiscount()');
    }

    /* แปลงเป็น object เดิมที่หน้าเว็บ/localStorage ใช้ */
    toJSON() {
        return {
            ...this.#meta,
            id: this.#productId,
            name: this.#name,
            price: this.#price,
            stock: this.#stock,
            quantity: this.#stock,
            desc: this.#description,
            description: this.#description,
            productType: this.constructor.name
        };
    }
}

/* =========================================================
   2. ClothingProduct extends Product   -> Inheritance, Polymorphism
   ========================================================= */
class ClothingProduct extends Product {
    #size;
    #color;
    #material;

    constructor(productId, name, price, stock, description,
        size = '', color = '', material = '', meta = {}) {
        super(productId, name, price, stock, description, meta);
        this.#size = size;
        this.#color = color;
        this.#material = material;
    }

    get size() { return this.#size; }
    get color() { return this.#color; }
    get material() { return this.#material; }

    // Override: เสื้อผ้าลด 10% ของราคา
    calculateDiscount() {
        return Math.round(this.price * 0.10);
    }

    getSizeGuide() {
        return this.#size
            ? `ไซซ์ ${this.#size} (สี${this.#color || '-'}, ${this.#material || 'ไม่ระบุวัสดุ'})`
            : 'ผู้ขายไม่ได้ระบุไซซ์';
    }

    toJSON() {
        return {
            ...super.toJSON(),
            size: this.#size,
            color: this.#color,
            material: this.#material
        };
    }
}

/* =========================================================
   3. AccessoryProduct extends Product  -> Inheritance, Polymorphism
   ========================================================= */
class AccessoryProduct extends Product {
    #accessoryType;
    #warrantyMonths;

    constructor(productId, name, price, stock, description,
        accessoryType = '', warrantyMonths = 0, meta = {}) {
        super(productId, name, price, stock, description, meta);
        this.#accessoryType = accessoryType;
        this.#warrantyMonths = Number(warrantyMonths) || 0;
    }

    get accessoryType() { return this.#accessoryType; }
    get warrantyMonths() { return this.#warrantyMonths; }

    // Override: เครื่องประดับ/อื่นๆ ลด 5% ของราคา
    calculateDiscount() {
        return Math.round(this.price * 0.05);
    }

    toJSON() {
        return {
            ...super.toJSON(),
            accessoryType: this.#accessoryType,
            warrantyMonths: this.#warrantyMonths
        };
    }
}

/* =========================================================
   4. Category  (aggregation: Category ---o Product)
   ========================================================= */
class Category {
    #categoryId;
    #categoryName;
    #products = [];

    constructor(categoryId, categoryName) {
        this.#categoryId = categoryId;
        this.#categoryName = categoryName;
    }

    get categoryId() { return this.#categoryId; }
    get categoryName() { return this.#categoryName; }

    addProduct(product) {
        if (!(product instanceof Product)) {
            throw new TypeError('ต้องเป็น Product');
        }
        this.#products.push(product);
    }

    listProducts() {
        return [...this.#products];
    }
}

/* =========================================================
   5. CartItem
   ========================================================= */
class CartItem {
    #product;
    #quantity;

    constructor(product, quantity) {
        this.#product = product;
        this.quantity = quantity;
    }

    get product() { return this.#product; }
    get quantity() { return this.#quantity; }
    set quantity(value) {
        const n = Number(value);
        if (!Number.isInteger(n) || n < 1) {
            throw new Error('จำนวนต้องเป็นจำนวนเต็มตั้งแต่ 1 ขึ้นไป');
        }
        this.#quantity = n;
    }

    getSubtotal() {
        return this.#product.price * this.#quantity;
    }
}

/* =========================================================
   6. Cart
   ========================================================= */
class Cart {
    #cartId;
    #items = [];

    constructor(cartId) {
        this.#cartId = cartId;
    }

    get cartId() { return this.#cartId; }
    get items() { return [...this.#items]; }

    addItem(product, qty = 1) {
        if (!product.checkStock(qty)) {
            throw new Error('สินค้าไม่พอในสต็อก');
        }
        const found = this.#items.find(i => String(i.product.productId) === String(product.productId));
        if (found) {
            const newQty = found.quantity + Number(qty);
            if (!product.checkStock(newQty)) {
                throw new Error('สินค้าไม่พอในสต็อก');
            }
            found.quantity = newQty;
        } else {
            this.#items.push(new CartItem(product, qty));
        }
    }

    removeItem(productId) {
        this.#items = this.#items.filter(i => String(i.product.productId) !== String(productId));
    }

    calculateTotal() {
        return this.#items.reduce((sum, i) => sum + i.getSubtotal(), 0);
    }

    clear() {
        this.#items = [];
    }
}

/* =========================================================
   7. Payment (abstract)            -> Abstraction
   ========================================================= */
class Payment {
    #paymentId;
    #amount;
    #paymentDate;

    constructor(paymentId, amount) {
        if (new.target === Payment) {
            throw new TypeError('Payment เป็น abstract class สร้างตรงๆ ไม่ได้');
        }
        this.#paymentId = paymentId;
        const n = Number(amount);
        if (!Number.isFinite(n) || n < 0) {
            throw new Error('ยอดชำระไม่ถูกต้อง');
        }
        this.#amount = n;
        this.#paymentDate = null;
    }

    get paymentId() { return this.#paymentId; }
    get amount() { return this.#amount; }
    get paymentDate() { return this.#paymentDate; }

    // คลาสลูกเรียกเมื่อชำระสำเร็จ
    _markPaid() { this.#paymentDate = new Date(); }

    // abstract method
    pay() {
        throw new Error('คลาสลูกต้อง override pay()');
    }

    getPaymentReceipt() {
        const date = this.#paymentDate
            ? this.#paymentDate.toLocaleString('th-TH')
            : 'ยังไม่ชำระ';
        return `ใบเสร็จ ${this.#paymentId} | ยอด ฿${this.#amount} | ${date}`;
    }
}

/* =========================================================
   8. PromptPayPayment extends Payment  -> Inheritance, Polymorphism
   ========================================================= */
class PromptPayPayment extends Payment {
    #qrCodeUrl;
    #refCode;
    #isVerified;

    constructor(paymentId, amount, qrCodeUrl = '') {
        super(paymentId, amount);
        this.#qrCodeUrl = qrCodeUrl || '';
        this.#refCode = '';
        this.#isVerified = false;
    }

    get qrCodeUrl() { return this.#qrCodeUrl; }
    get refCode() { return this.#refCode; }
    get isVerified() { return this.#isVerified; }

    // Override: ชำระผ่าน PromptPay (จำลอง) สร้างรหัสอ้างอิงและบันทึกเวลา
    pay() {
        if (this.amount <= 0) return false;
        this.#refCode = 'PP' + Date.now().toString(36).toUpperCase();
        this._markPaid();
        return true;
    }

    // ตรวจสลิป (จำลอง): ต้องมีข้อมูลสลิปและชำระแล้ว
    verifySlip(slip) {
        this.#isVerified = Boolean(slip) && this.#refCode !== '';
        return this.#isVerified;
    }

    getPaymentReceipt() {
        return super.getPaymentReceipt() + ` | Ref ${this.#refCode || '-'}`;
    }
}

/* =========================================================
   9. Order
   ========================================================= */
class Order {
    static STATUSES = ['รอชำระเงิน', 'กำลังเตรียมจัดส่ง', 'จัดส่งแล้ว', 'ยกเลิก'];

    #orderId;
    #items = [];
    #totalAmount = 0;
    #orderDate;
    #status;
    #payment;

    constructor(orderId, payment) {
        this.#orderId = orderId;
        this.#payment = payment;
        this.#orderDate = new Date();
        this.#status = 'รอชำระเงิน';
    }

    get orderId() { return this.#orderId; }
    get items() { return [...this.#items]; }
    get totalAmount() { return this.#totalAmount; }
    get orderDate() { return this.#orderDate; }
    get status() { return this.#status; }
    get payment() { return this.#payment; }

    createOrder(cart) {
        if (cart.items.length === 0) {
            throw new Error('ตะกร้าว่าง สร้างคำสั่งซื้อไม่ได้');
        }
        this.#items = cart.items;
        this.#totalAmount = cart.calculateTotal();
    }

    updateStatus(status) {
        if (!Order.STATUSES.includes(status)) {
            throw new Error('สถานะไม่ถูกต้อง: ' + status);
        }
        this.#status = status;
    }

    processOrderPayment() {
        const ok = this.#payment.pay();
        if (ok) {
            this.#items.forEach(i => i.product.updateStock(-i.quantity));
            this.updateStatus('กำลังเตรียมจัดส่ง');
        }
        return ok;
    }

    /* รูปแบบข้อมูลเดิมที่ orders.html อ่านจาก localStorage */
    toJSON(extra = {}) {
        const first = this.#items[0];
        return {
            orderId: this.#orderId,
            product: first ? first.product.toJSON() : null,
            items: this.#items.map(i => ({
                product: i.product.toJSON(),
                quantity: i.quantity,
                subtotal: i.getSubtotal()
            })),
            quantity: first ? first.quantity : 0,
            unitPrice: first ? first.product.price : 0,
            itemTotal: this.#totalAmount,
            total: this.#payment.amount,
            status: this.#status,
            receipt: this.#payment.getPaymentReceipt(),
            createdAt: this.#orderDate.toISOString(),
            ...extra
        };
    }
}

/* =========================================================
   10. User
   ========================================================= */
class User {
    #userId;
    #username;
    #email;
    #address;
    #cart;

    constructor(userId, username, email = '', address = '') {
        this.#userId = userId;
        this.#username = username;
        this.#email = email;
        this.#address = address;
        this.#cart = new Cart('CART-' + userId);
    }

    get userId() { return this.#userId; }
    get username() { return this.#username; }
    get email() { return this.#email; }
    get address() { return this.#address; }
    set address(value) { this.#address = String(value || '').trim(); }
    get cart() { return this.#cart; }

    addToCart(product, qty = 1) {
        this.#cart.addItem(product, qty);
    }

    // สร้าง Order จากตะกร้า ส่งคืน Order (ยังไม่ชำระ ต้องเรียก processOrderPayment)
    checkout(payment) {
        const order = new Order('ORD-' + Date.now(), payment);
        order.createOrder(this.#cart);
        return order;
    }
}

/* =========================================================
   Factory: แปลง object สินค้าเดิมจาก localStorage -> Product
   (เสื้อผ้า/รองเท้า = ClothingProduct, อื่นๆ = AccessoryProduct)
   ========================================================= */
function createProductFromData(d) {
    const clothingCats = ['เสื้อผ้า', 'รองเท้า'];
    const {
        id, name, price, stock, quantity, desc, description,
        size, color, material, accessoryType, warrantyMonths,
        productType, ...meta
    } = d;
    const pid = id || ('P-' + Date.now());
    const stk = Number.isInteger(Number(stock)) ? Number(stock) : (Number(quantity) || 1);
    const text = desc || description || '';
    if (clothingCats.includes(d.category) || productType === 'ClothingProduct') {
        return new ClothingProduct(pid, name, price, stk, text, size, color, material, meta);
    }
    return new AccessoryProduct(pid, name, price, stk, text,
        accessoryType || d.category || '', warrantyMonths, meta);
}

const Models = {
    Product, ClothingProduct, AccessoryProduct, Category,
    CartItem, Cart, Payment, PromptPayPayment, Order, User,
    createProductFromData
};
if (typeof window !== 'undefined') window.Models = Models;
if (typeof module !== 'undefined') module.exports = Models;
