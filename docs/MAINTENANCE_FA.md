# نگهداری فورک ChatGPT RTL Support — نسخه 1.6.3

این سند مربوط به فورک [ehsanrs2/ChatGPT-RTL-Support](https://github.com/ehsanrs2/ChatGPT-RTL-Support) است؛ حقوق و مجوز MIT پروژه اصلی حفظ می‌شود.

## تغییرات تأییدشده

| نسخه | مسئله و اصلاح | شواهد |
| --- | --- | --- |
| 1.6.1 | اصلاح حفظ حالت On/Off و ظاهر سوئیچ و اضافه شدن Content Script پویا | تست‌های شبیه‌سازی؛ نسخه در سایت زنده هنوز مشکل داشت |
| 1.6.2 | پردازش بلوک‌های داخل main بدون وابستگی به message wrapper و کلاس markdown | گزارش Chrome: قبل از اصلاح messages=0، turns=0، mainMarked=0 با paragraphs=104 و headings=19؛ پس از اصلاح، ۱۵۹ عنصر RTL در main |
| 1.6.3 | بازبینی خودکار و مستقل از popup، تکمیل MutationObserver با بازبینی دوره‌ای/بازگشت به تب | تست مستقیم مالک در Chrome: تمام مشکلات مشاهده‌شده رفع شدند |

تأیید کاربر به همان مرورگر، تاریخ و سناریو محدود است؛ تغییرات آینده DOM سایت ممکن است به اصلاح مجدد نیاز داشته باشند.

## نصب از سورس فورک

1. دریافت سورس: `git clone https://github.com/ehsanrs2/ChatGPT-RTL-Support.git`.
2. در `chrome://extensions` گزینه Developer mode را فعال کنید.
3. Load unpacked را انتخاب کنید و پوشه اصلی شامل `manifest.json` را باز کنید.
4. نسخه‌های قبلی RTL را غیرفعال کنید تا چند Content Script با یکدیگر تداخل نکنند.
5. پس از تغییر فایل‌ها، اکستنشن و تب‌های ChatGPT را Reload کنید.

## معماری اجرایی

- `content.js` وضعیت را از Chrome storage می‌خواند و On/Off مستقل از popup کار می‌کند.
- بلوک‌های متنی داخل `main` و عنوان‌های سایدبار جداگانه شناسایی می‌شوند؛ کد و فرمول‌ها LTR باقی می‌مانند.
- `MutationObserver` تغییرات سریع و استریم را مدیریت می‌کند؛ هنگام On بودن و قابل‌مشاهده بودن تب، بازبینی تکمیلی هر ۳ ثانیه انجام می‌شود.
- هنگام بازگشت به تب و تغییر ناوبری/ریشه DOM نیز بازبینی و در صورت نیاز اتصال Observer بازیابی می‌شود.
- در حالت Off، Observer و تایمر غیرفعال و علامت‌ها و استایل‌های افزونه پاک می‌شوند.
- باز کردن popup برای پردازش پیام جدید لازم نیست.

## مجوزها و حریم خصوصی

Manifest از مجوزهای Chrome شامل `storage`، `scripting`، `tabs` و host permissions برای دامنه‌های ChatGPT استفاده می‌کند. موتور RTL محتوای نمایشی را محلی برای تشخیص جهت می‌خواند؛ کد پردازش RTL اصلاح‌شده برای ارسال متن گفتگو به سرور نوشته نشده است. هنگام انتشار جدید باید permissionها و رفتار شبکه دوباره بررسی شوند. در کد اولیه، `background.js` در نصب یا آپدیت یک صفحه معرفی خارجی باز می‌کند.

## آزمون محلی

```bash
python -m pip install -r tests/requirements.txt
python -m playwright install chromium
python tests/test_mock_browser.py
python tests/test_dom_probe_v162.py
python tests/test_auto_reconcile.py
```

تست‌ها به‌طور پیش‌فرض از Chromium سیستم در صورت موجود بودن و در غیر این صورت از Chromium مدیریت‌شده Playwright استفاده می‌کنند. با `CI=true` مرورگر مدیریت‌شده انتخاب می‌شود. متغیر `RTL_CHROMIUM_EXECUTABLE` امکان انتخاب مسیر سفارشی را فراهم می‌کند.

Workflow در `.github/workflows/rtl-regression.yml` روی Push و Pull Request تست نحوی JavaScript، ساختار Manifest و سه تست Chromium را اجرا می‌کند.

این‌ها آزمون‌های DOM شبیه‌سازی‌شده‌اند؛ به حساب کاربر یا سایت زنده ChatGPT متصل نمی‌شوند.

## گزارش مشکل آینده

در DevTools و پس از انتخاب پاراگراف مسئله‌دار، فایل `diagnostics/live_dom_probe.js` را اجرا کنید و فقط اطلاعات ساختاری و شمارنده‌ها را گزارش دهید. متن چت یا HTML خام را در GitHub Issues منتشر نکنید.

مدارک قدیمی‌تر: `TESTING_FA.md`، `V162_TESTING_FA.md` و `V163_TESTING_FA.md`.
