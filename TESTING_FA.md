# آزمون اصلاح RTL نسخه 1.6.1

این نسخه آزمایشی است؛ در سایت زنده ChatGPT هنوز تأیید نشده است.

## نصب نسخه کامل GitHub
1. از شاخه `fix/rtl-dynamic-content-v161` فورک، فایل ZIP را دریافت و استخراج کنید.
2. در `chrome://extensions` اکستنشن‌های قدیمی را خاموش کنید.
3. Developer Mode و Load unpacked را انتخاب کرده و **پوشه اصلی ریپازیتوری** (دارای `manifest.json` و پوشه `assets/`) را انتخاب کنید.
4. تمام تب‌های ChatGPT را یک بار Refresh کنید.

## موارد آزمون
- وقتی کلید On است، نشانگر باید سمت چپ (روی کلمه On) باشد؛ Off سمت راست.
- باز کردن دوباره popup نباید وضعیت ذخیره‌شده را تغییر دهد.
- عنوان‌ها و پاراگراف‌های فارسی قبلی باید سمت راست باشند.
- پس از فرستادن پیام جدید یا دریافت پاسخ در حال استریم نیز RTL باید اعمال شود.
- پاراگراف انگلیسی، کد و معادلات باید چپ‌به‌راست باقی بمانند.
- Off باید تمام تغییرات RTL را پاک کند و On بدون نیاز به باز کردن دوباره popup یا Reload آنها را برگرداند.

## عیب‌یابی در Chrome DevTools همان تب ChatGPT
در بخش Console دستورهای زیر را جداگانه اجرا کنید:

```javascript
document.documentElement.getAttribute('data-chatgpt-rtl-active')
document.querySelectorAll('[data-message-author-role], [data-testid^="conversation-turn"]').length
document.querySelectorAll('[data-chatgpt-rtl-dir]').length
Boolean(document.getElementById('chatgpt-rtl-support-style'))
```

در حالت On باید به‌ترتیب `"true"`، تعداد پیام‌های قابل شناسایی، تعداد عناصر علامت‌خورده و `true` ببینید.

اگر خط اول `null` بود، Content Script در این تب فعال نشده است؛ در `chrome://extensions` صفحه **Errors** اکستنشن را بررسی کنید و تب را Reload کنید. اگر خط اول `"true"` بود ولی تعداد پیام‌ها صفر شد، احتمالاً ساختار HTML نسخه فعلی ChatGPT با انتخابگرها متفاوت است. هنگام ارسال گزارش، فقط همین چهار مقدار و متن خطاها را بفرستید؛ نیازی به ارسال متن چت‌های خصوصی نیست.

## آزمون خودکار
فایل `tests/test_mock_browser.py` از Playwright/Chromium استفاده می‌کند و روی DOM شبیه‌سازی‌شده اجرا می‌شود. این آزمون به‌هیچ‌وجه جای آزمون سایت زنده را نمی‌گیرد.
