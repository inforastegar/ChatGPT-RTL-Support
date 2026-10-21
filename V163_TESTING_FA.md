# نسخه 1.6.3 — همگام‌سازی بدون باز کردن popup

## علت و محدوده اصلاح

کاربر در Chrome مشاهده کرد که بعضی پیام‌ها فقط پس از باز کردن popup راست‌چین می‌شوند. در کد نسخه 1.6.2، popup در حالت On پیام sync می‌فرستاد و تابع refreshAll مجدداً اجرا می‌شد. علت دقیق از دست رفتن بعضی تغییرات DOM هنوز در سایت زنده به‌طور قطعی مشخص نشده است.

در نسخه 1.6.3:
- MutationObserver همچنان به‌صورت سریع تغییرات متنی را پردازش می‌کند.
- هر ۳ ثانیه فقط وقتی صفحه visible و اکستنشن On باشد refreshAll مستقل از popup اجرا می‌شود.
- هنگام focus، pageshow، popstate و بازگشت صفحه به حالت visible بازبینی انجام می‌شود.
- اگر documentElement تعویض شود، اتصال Observer، ویژگی فعال‌سازی و استایل بازیابی می‌شوند.
- مسیر پردازش message wrapper نیز fallback مربوط به بلوک‌های main را اجرا می‌کند.
- در حالت Off، interval و event listenerهای جدید متوقف و علامت‌های RTL پاک می‌شوند.

### وضعیت تست

تست Playwright/Chromium با DOM شبیه‌سازی‌شده موفق شد:
1. راست‌چین شدن متن اولیه، پیام تازه و استریم بدون popup
2. بازیابی علامت RTL حذف‌شده بدون MutationObserver قابل‌اتکا
3. بازیابی پس از تعویض ریشه HTML و ادامه درج پیام‌ها
4. خاموش بودن اصلاحات و تایمرها در حالت Off و روشن شدن مجدد

**آزمون واقعی سایت ChatGPT هنوز انجام نشده است.** PR را پیش از تأیید مالک با main ادغام نکنید.

### تست روی Chrome

- از شاخه fix/rtl-autosync-without-popup-v163 نسخه کامل را دریافت کنید و از chrome://extensions گزینه Reload اکستنشن را بزنید. تب ChatGPT را نیز Reload کنید.
- On را فعال و popup را ببندید. چند پیام جدید ارسال کنید، پاسخ در حال تولید را ببینید و بین دو چت حرکت کنید.
- بدون باز کردن مجدد popup بررسی کنید پیام‌ها و عنوان‌ها RTL باقی مانده‌اند.
- در DevTools کنسول، چک کنید:
```javascript
document.querySelectorAll('main [data-chatgpt-rtl-dir="rtl"]').length
document.documentElement.getAttribute('data-chatgpt-rtl-active')
```
- اگر مشکل همچنان رخ داد، با popup بسته، محتوای diagnostics/live_dom_probe.js را اجرا کنید و فقط مقادیر ساختاری را ارسال کنید.

### اجرای تست رگرسیون محلی

```bash
python -m pip install playwright
python tests/test_auto_reconcile.py
```

تست از Chromium نصب‌شده در `/usr/bin/chromium` استفاده می‌کند.
