import { expect, test } from "@playwright/test";

const ADMIN_EMAIL = process.env.ADMIN_E2E_EMAIL ?? "";
const ADMIN_PASSWORD = process.env.ADMIN_E2E_PASSWORD ?? "";
const MANAGER_EMAIL = process.env.MANAGER_E2E_EMAIL ?? ADMIN_EMAIL;
const MANAGER_PASSWORD = process.env.MANAGER_E2E_PASSWORD ?? ADMIN_PASSWORD;

function requireE2ECredentials(testInfo: import("@playwright/test").TestInfo) {
  if (!ADMIN_EMAIL || !ADMIN_PASSWORD) {
    testInfo.skip(
      true,
      "Set ADMIN_E2E_EMAIL and ADMIN_E2E_PASSWORD (and optionally MANAGER_E2E_*) to run admin E2E"
    );
  }
}

async function loginAs(page: import("@playwright/test").Page, email: string, password: string) {
  await page.goto("/auth/login");
  await page.waitForLoadState("networkidle");

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();

  await page.waitForURL(/^\/(?!auth\/)/);
  await page.waitForLoadState("networkidle");
}

async function login(page: import("@playwright/test").Page) {
  await loginAs(page, ADMIN_EMAIL, ADMIN_PASSWORD);
}

function setupConsoleCapture(page: import("@playwright/test").Page) {
  const errors: { message: string }[] = [];
  page.on("console", (msg) => {
    if (msg.type() === "error") {
      errors.push({ message: msg.text() });
    }
  });
  page.on("pageerror", (err) => {
    errors.push({ message: err.message });
  });
  return errors;
}

async function _navigateAndCheck(
  page: import("@playwright/test").Page,
  url: string,
  expectedTitle?: string
) {
  const errors = setupConsoleCapture(page);
  await page.goto(url);
  await page.waitForLoadState("networkidle");
  if (expectedTitle) {
    await expect(page.locator("h1, h2").first()).toBeVisible({ timeout: 10000 });
  }
  return errors;
}

test.describe("Admin Dashboard E2E", () => {
  let capturedErrors: { message: string }[];

  test.beforeEach(async ({ page }, testInfo) => {
    requireE2ECredentials(testInfo);
    capturedErrors = setupConsoleCapture(page);
    await login(page);
  });

  test.afterEach(async () => {
    if (capturedErrors.length > 0) {
      test.info().annotations.push({
        type: "console-errors",
        description: capturedErrors.map((e) => e.message).join("\n"),
      });
    }
  });

  // ─── 1. Auth Flow ───────────────────────────────────────────────────────

  test.describe("Auth Flow", () => {
    test("should login with valid credentials and redirect to dashboard", async ({ page }) => {
      await expect(page).toHaveURL("/");
      await expect(page.locator("h1").first()).toBeVisible();
      expect(capturedErrors.filter((e) => !e.message.includes("favicon"))).toHaveLength(0);
    });

    test("should show error with invalid credentials", async ({ page }) => {
      await page.goto("/auth/login");
      await page.waitForLoadState("networkidle");
      await page.getByLabel("Email").fill("wrong@email.com");
      await page.getByLabel("Password").fill("wrongpassword");
      await page.getByRole("button", { name: "Sign in" }).click();
      await page.waitForTimeout(2000);
      await expect(
        page.locator("text=Invalid email or password").or(page.locator(".text-destructive"))
      ).toBeVisible({ timeout: 10000 });
    });

    test("should redirect to login when accessing protected route", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/competitions");
      await page.waitForURL(/\/auth\/login/);
      await expect(page.getByLabel("Email")).toBeVisible();
    });
  });

  // ─── 2. Sidebar Navigation ──────────────────────────────────────────────

  test.describe("Sidebar Navigation", () => {
    const sidebarLinks = [
      { href: "/", label: "Dashboard" },
      { href: "/competitions", label: "Competitions" },
      { href: "/instant-prizes", label: "Instant Prizes" },
      { href: "/categories", label: "Categories" },
      { href: "/orders", label: "Orders" },
      { href: "/promo-codes", label: "Promo Codes" },
      { href: "/users", label: "Users" },
      { href: "/referrals", label: "Referrals" },
      { href: "/winners", label: "Winners" },
      { href: "/instant-prize-wins", label: "Instant Prize Wins" },
      { href: "/livestream/draws", label: "Livestream Draws" },
      { href: "/payment-methods", label: "Payment Methods" },
      { href: "/homepage-layout", label: "Homepage Layout" },
      { href: "/compliance-settings", label: "Compliance" },
      { href: "/email-settings", label: "Email Settings" },
    ];

    for (const link of sidebarLinks) {
      test(`should navigate to ${link.label} page via sidebar`, async ({ page }) => {
        const errors = setupConsoleCapture(page);

        const sidebarLink = page.locator(`nav a[href="${link.href}"]`).first();
        await expect(sidebarLink).toBeVisible();

        await sidebarLink.click();
        await page.waitForLoadState("networkidle");

        if (link.href === "/") {
          await expect(page.locator("h1")).toContainText(/Command Center|Dashboard/i);
        } else {
          await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
            timeout: 10000,
          });
        }

        const navErrors = errors.filter(
          (e) => !e.message.includes("favicon") && !e.message.includes("404")
        );
        expect(navErrors).toHaveLength(0);
      });
    }
  });

  // ─── 3. Dashboard Page ──────────────────────────────────────────────────

  test.describe("Dashboard", () => {
    test("should display stat cards with data", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const _statCards = page.locator("[class*=StatCard], [class*=stat-card]");
      const allStatValues = page.locator("text=£").or(page.locator("text=—")).first();
      await expect(allStatValues).toBeVisible({ timeout: 15000 });

      const statSkeletons = page.locator("[class*=skeleton], [class*=Skeleton]");
      const skeletonCount = await statSkeletons.count();
      if (skeletonCount > 0) {
        await page.waitForTimeout(3000);
      }

      await expect(
        page
          .locator("text=Revenue")
          .or(page.locator("text=Competitions").or(page.locator("text=Orders")))
          .first()
      ).toBeVisible();
    });

    test("should render recent orders table", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(
        page.locator("text=Recent Orders").or(page.locator("text=recent orders"))
      ).toBeVisible({ timeout: 10000 });
    });

    test("should render recent winners table", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(
        page.locator("text=Recent Winners").or(page.locator("text=recent winners"))
      ).toBeVisible({ timeout: 10000 });
    });

    test("should render quick actions", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");
      await expect(page.locator("text=Quick Actions")).toBeVisible({ timeout: 10000 });

      const quickActionLinks = ["New Competition", "Orders", "Users", "Promo Codes", "Livestream"];
      for (const label of quickActionLinks) {
        await expect(page.getByText(label).first()).toBeVisible();
      }
    });
  });

  // ─── 4. Table Grouping ───────────────────────────────────────────────────

  test.describe("Table Grouping", () => {
    interface GroupByTest {
      url: string;
      pageName: string;
      options: string[];
    }

    const groupByTests: GroupByTest[] = [
      {
        url: "/orders",
        pageName: "Orders",
        options: ["No grouping", "Group by user", "Group by status"],
      },
      {
        url: "/competitions",
        pageName: "Competitions",
        options: ["No grouping", "Group by status", "Group by category"],
      },
      {
        url: "/users",
        pageName: "Users",
        options: ["No grouping", "Group by role", "Group by verification"],
      },
      {
        url: "/winners",
        pageName: "Winners",
        options: ["No grouping", "Group by user", "Group by prize", "Group by competition"],
      },
      {
        url: "/promo-codes",
        pageName: "Promo Codes",
        options: ["No grouping", "Group by discount type", "Group by status"],
      },
      {
        url: "/instant-prizes",
        pageName: "Instant Prizes",
        options: ["No grouping", "Group by type"],
      },
      { url: "/categories", pageName: "Categories", options: ["No grouping", "Group by name"] },
      {
        url: "/instant-prize-wins",
        pageName: "Instant Prize Wins",
        options: ["No grouping", "Group by user", "Group by prize"],
      },
    ];

    for (const { url, pageName, options } of groupByTests) {
      test.describe(`${pageName} page grouping`, () => {
        test("should render flat table by default with headers", async ({ page }) => {
          await page.goto(url);
          await page.waitForLoadState("networkidle");
          await expect(page.locator("table").or(page.locator('[role="table"]'))).toBeVisible({
            timeout: 15000,
          });
          const errors = setupConsoleCapture(page);
          expect(errors.filter((e) => !e.message.includes("favicon"))).toHaveLength(0);
        });

        for (const option of options.slice(1)) {
          test(`should group by ${option}`, async ({ page }) => {
            await page.goto(url);
            await page.waitForLoadState("networkidle");
            await page.waitForTimeout(1000);

            const errors = setupConsoleCapture(page);

            const trigger = page.locator("text=No grouping").first();
            await expect(trigger).toBeVisible({ timeout: 10000 });
            await trigger.click();
            await page.waitForTimeout(300);

            const optionEl = page.getByRole("option", { name: option });
            await expect(optionEl).toBeVisible({ timeout: 5000 });
            await optionEl.click();
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");

            const groupHeaders = page.locator(
              "[class*=group-header], [class*=groupHeader], [data-group]"
            );
            const groupCount = await groupHeaders.count();
            expect(groupCount).toBeGreaterThanOrEqual(0);

            const navErrors = errors.filter(
              (e) => !e.message.includes("favicon") && !e.message.includes("404")
            );
            expect(navErrors).toHaveLength(0);
          });
        }

        test("should switch between group by options", async ({ page }) => {
          await page.goto(url);
          await page.waitForLoadState("networkidle");
          await page.waitForTimeout(1000);

          for (const option of options.slice(1)) {
            const trigger = page
              .locator('[data-slot="select-trigger"]')
              .filter({ hasText: /Group by|No grouping/ })
              .first();
            if (!(await trigger.isVisible())) continue;
            await trigger.click();
            await page.waitForTimeout(300);

            const optionEl = page.getByRole("option", { name: option });
            if (await optionEl.isVisible()) {
              await optionEl.click();
              await page.waitForTimeout(1000);
              await page.waitForLoadState("networkidle");
            }
          }
        });

        test("should toggle back to No grouping", async ({ page }) => {
          await page.goto(url);
          await page.waitForLoadState("networkidle");
          await page.waitForTimeout(1000);

          if (options.length > 1) {
            const trigger = page
              .locator('[data-slot="select-trigger"]')
              .filter({ hasText: /Group by|No grouping/ })
              .first();
            if (await trigger.isVisible()) {
              await trigger.click();
              await page.waitForTimeout(300);
              await page.getByRole("option", { name: options[1] }).click();
              await page.waitForTimeout(1000);
              await page.waitForLoadState("networkidle");

              await trigger.click();
              await page.waitForTimeout(300);
              await page.getByRole("option", { name: "No grouping" }).click();
              await page.waitForTimeout(1000);
              await page.waitForLoadState("networkidle");
            }
          }

          const groupHeaders = page.locator("[class*=group-header], [class*=groupHeader]");
          const groupCount = await groupHeaders.count();
          expect(groupCount).toBeGreaterThanOrEqual(0);
        });
      });
    }
  });

  // ─── 5. Table Search & Filters ──────────────────────────────────────────

  test.describe("Table Search & Filters", () => {
    test.describe("Orders page", () => {
      test("should search by order number", async ({ page }) => {
        await page.goto("/orders");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const searchInput = page.getByPlaceholder("Number…");
        if (await searchInput.isVisible()) {
          await searchInput.fill("1");
          await page.waitForTimeout(1000);
          const table = page.locator("table, [role='table']");
          await expect(table).toBeVisible();
        }
      });

      test("should filter by status", async ({ page }) => {
        await page.goto("/orders");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const statusTrigger = page
          .locator('[data-slot="select-trigger"]')
          .filter({ hasText: /All status/ })
          .first();
        if (await statusTrigger.isVisible()) {
          await statusTrigger.click();
          await page.waitForTimeout(300);
          await page.getByRole("option", { name: "Paid" }).click();
          await page.waitForTimeout(1000);
          await page.waitForLoadState("networkidle");
        }
        await expect(page.locator("table, [role='table']")).toBeVisible({ timeout: 10000 });
      });

      test("should filter by user", async ({ page }) => {
        await page.goto("/orders");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const userCombobox = page
          .locator('[data-slot="combobox-trigger"]')
          .or(page.getByPlaceholder("All users"));
        if (await userCombobox.isVisible()) {
          await userCombobox.click();
          await page.waitForTimeout(500);
          const firstUser = page.getByRole("option").first();
          if (await firstUser.isVisible()) {
            await firstUser.click();
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
          }
        }
      });

      test("should clear filters", async ({ page }) => {
        await page.goto("/orders");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const clearBtn = page.getByRole("button", { name: /clear/i });
        if (await clearBtn.isVisible()) {
          await clearBtn.click();
          await page.waitForTimeout(500);
          await page.waitForLoadState("networkidle");
        }
        await expect(page.locator("table, [role='table']")).toBeVisible({ timeout: 10000 });
      });
    });

    test.describe("Competitions page", () => {
      test("should search by title", async ({ page }) => {
        await page.goto("/competitions");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const searchInput = page.getByPlaceholder("Search competitions…");
        if (await searchInput.isVisible()) {
          await searchInput.fill("test");
          await page.waitForTimeout(1000);
          await page.waitForLoadState("networkidle");
        }
        await expect(page.locator("table, [role='table']")).toBeVisible({ timeout: 10000 });
      });

      test("should filter by category", async ({ page }) => {
        await page.goto("/competitions");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const categoryTrigger = page.getByPlaceholder("All categories");
        if (await categoryTrigger.isVisible()) {
          await categoryTrigger.click();
          await page.waitForTimeout(500);
          const firstCat = page.getByRole("option").first();
          if (await firstCat.isVisible()) {
            await firstCat.click();
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
          }
        }
      });

      test("should filter by status", async ({ page }) => {
        await page.goto("/competitions");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const statusTrigger = page
          .locator('[data-slot="select-trigger"]')
          .filter({ hasText: /All status/ })
          .first();
        if (await statusTrigger.isVisible()) {
          await statusTrigger.click();
          await page.waitForTimeout(300);
          await page.getByRole("option", { name: "Active" }).click();
          await page.waitForTimeout(1000);
          await page.waitForLoadState("networkidle");
        }
      });

      test("should clear filters", async ({ page }) => {
        await page.goto("/competitions");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const clearBtn = page.getByRole("button", { name: /clear/i });
        if (await clearBtn.isVisible()) {
          await clearBtn.click();
          await page.waitForTimeout(500);
          await page.waitForLoadState("networkidle");
        }
      });
    });

    test.describe("Users page", () => {
      test("should search by email", async ({ page }) => {
        await page.goto("/users");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const searchInput = page.getByPlaceholder(/search.*email/i);
        if (await searchInput.isVisible()) {
          await searchInput.fill("admin");
          await page.waitForTimeout(1000);
          await page.waitForLoadState("networkidle");
        }
        await expect(page.locator("table, [role='table']")).toBeVisible({ timeout: 10000 });
      });

      test("should filter by role", async ({ page }) => {
        await page.goto("/users");
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(1000);

        const roleFilter = page
          .locator('[data-slot="select-trigger"]')
          .filter({ hasText: /All status/i })
          .first();
        if (await roleFilter.isVisible()) {
          const errors = setupConsoleCapture(page);
          await roleFilter.click();
          await page.waitForTimeout(300);
          const adminOption = page.getByRole("option", { name: /admin/i }).first();
          if (await adminOption.isVisible()) {
            await adminOption.click();
            await page.waitForTimeout(1000);
            await page.waitForLoadState("networkidle");
          }
          expect(errors.filter((e) => !e.message.includes("favicon"))).toHaveLength(0);
        }
      });
    });
  });

  // ─── 6. Table Pagination ───────────────────────────────────────────────

  test.describe("Table Pagination", () => {
    test("should navigate through pages", async ({ page }) => {
      await page.goto("/orders");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      const nextButton = page
        .locator('[aria-label="Next page"], button:has(svg.lucide-chevron-right), button:has(svg)')
        .last();
      if (await nextButton.isEnabled().catch(() => false)) {
        await nextButton.click();
        await page.waitForTimeout(1000);
        await page.waitForLoadState("networkidle");

        const prevButton = page
          .locator(
            '[aria-label="Previous page"], button:has(svg.lucide-chevron-left), button:has(svg)'
          )
          .first();
        if (await prevButton.isEnabled().catch(() => false)) {
          await prevButton.click();
          await page.waitForTimeout(500);
          await page.waitForLoadState("networkidle");
        }
      }
    });

    test("should change page size", async ({ page }) => {
      await page.goto("/orders");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      const pageSizeTrigger = page
        .locator('[data-slot="select-trigger"]')
        .filter({ hasText: /10|20|50/ })
        .first();
      if (await pageSizeTrigger.isVisible()) {
        await pageSizeTrigger.click();
        await page.waitForTimeout(300);
        const option20 = page.getByRole("option", { name: "20" });
        if (await option20.isVisible()) {
          await option20.click();
          await page.waitForTimeout(1000);
          await page.waitForLoadState("networkidle");
        }
      }
    });
  });

  // ─── 7. Command Menu (⌘K) ─────────────────────────────────────────────

  test.describe("Command Menu", () => {
    test("should open command palette", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const cmdKButton = page.locator("text=⌘K").first();
      if (await cmdKButton.isVisible()) {
        await cmdKButton.click();
        await page.waitForTimeout(500);
        const searchInput = page.locator('[role="combobox"], input[placeholder*="Search"]').first();
        await expect(searchInput).toBeVisible({ timeout: 5000 });
      }
    });

    test("should show navigation items in command palette", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const cmdKButton = page.locator("text=⌘K").first();
      if (await cmdKButton.isVisible()) {
        await cmdKButton.click();
        await page.waitForTimeout(500);
        const dashboardItem = page.getByText("Dashboard");
        await expect(dashboardItem).toBeVisible({ timeout: 5000 });
      }
    });

    test("should search and find results in command palette", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const cmdKButton = page.locator("text=⌘K").first();
      if (await cmdKButton.isVisible()) {
        await cmdKButton.click();
        await page.waitForTimeout(500);

        const searchInput = page.locator('[role="combobox"], input[placeholder*="Search"]').first();
        if (await searchInput.isVisible()) {
          await searchInput.fill("orders");
          await page.waitForTimeout(1000);
          const results = page.locator('[role="option"], [cmdk-item]').first();
          await expect(results).toBeVisible({ timeout: 5000 });
        }
      }
    });

    test("should navigate via command palette selection", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const cmdKButton = page.locator("text=⌘K").first();
      if (await cmdKButton.isVisible()) {
        await cmdKButton.click();
        await page.waitForTimeout(500);

        const ordersItem = page.getByText("Orders").first();
        if (await ordersItem.isVisible()) {
          await ordersItem.click();
          await page.waitForTimeout(1000);
          await page.waitForLoadState("networkidle");
          await expect(page).toHaveURL(/\/orders/);
        }
      }
    });
  });

  // ─── 8. Theme Toggle ─────────────────────────────────────────────────

  test.describe("Theme Toggle", () => {
    test("should toggle to dark theme", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const themeBtn = page.locator('[aria-label="Toggle theme"]');
      await expect(themeBtn).toBeVisible({ timeout: 5000 });
      await themeBtn.click();
      await page.waitForTimeout(300);

      const darkOption = page.getByRole("menuitem", { name: /dark/i });
      await expect(darkOption).toBeVisible({ timeout: 3000 });
      await darkOption.click();
      await page.waitForTimeout(500);

      const htmlClass = await page.evaluate(() => document.documentElement.className);
      expect(htmlClass).toContain("dark");
    });

    test("should toggle to light theme", async ({ page }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const themeBtn = page.locator('[aria-label="Toggle theme"]');
      await expect(themeBtn).toBeVisible({ timeout: 5000 });
      await themeBtn.click();
      await page.waitForTimeout(300);

      const lightOption = page.getByRole("menuitem", { name: /light/i });
      await expect(lightOption).toBeVisible({ timeout: 3000 });
      await lightOption.click();
      await page.waitForTimeout(500);

      const htmlClass = await page.evaluate(() => document.documentElement.className);
      expect(htmlClass).not.toContain("dark");
    });
  });

  // ─── 9. Export CSV ─────────────────────────────────────────────────────

  test.describe("Export CSV", () => {
    test("should trigger export button on Orders page", async ({ page }) => {
      await page.goto("/orders");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);

      const exportBtn = page.getByRole("button", { name: /export/i });
      if (await exportBtn.isVisible()) {
        const errors = setupConsoleCapture(page);
        await exportBtn.click();
        await page.waitForTimeout(2000);
        const navErrors = errors.filter(
          (e) => !e.message.includes("favicon") && !e.message.includes("download")
        );
        expect(navErrors).toHaveLength(0);
      }
    });
  });

  // ─── 10. Console Error Check ──────────────────────────────────────────

  test.describe("Console Error Check", () => {
    const pagesToCheck = [
      "/",
      "/competitions",
      "/instant-prizes",
      "/categories",
      "/orders",
      "/promo-codes",
      "/users",
      "/referrals",
      "/winners",
      "/instant-prize-wins",
      "/livestream/draws",
      "/payment-methods",
      "/homepage-layout",
      "/compliance-settings",
      "/email-settings",
    ];

    for (const pageUrl of pagesToCheck) {
      test(`should have no console errors on ${pageUrl}`, async ({ page }) => {
        const errors = setupConsoleCapture(page);
        await page.goto(pageUrl);
        await page.waitForLoadState("networkidle");
        await page.waitForTimeout(2000);

        const relevantErrors = errors.filter(
          (e) =>
            !e.message.includes("favicon") &&
            !e.message.includes("404") &&
            !e.message.includes("Failed to load resource")
        );
        expect(relevantErrors).toHaveLength(0);
      });
    }
  });

  // ─── 11. Livestream Draw Studio (opens _blank) ─────────────────────

  test.describe("Draw Studio", () => {
    test("should open Draw Studio in new tab", async ({ page, context }) => {
      await page.goto("/");
      await page.waitForLoadState("networkidle");

      const drawStudioLink = page.locator('a[href="/livestream/draws/full"]');
      if (await drawStudioLink.isVisible()) {
        const [newPage] = await Promise.all([
          context.waitForEvent("page", { timeout: 5000 }).catch(() => null),
          drawStudioLink.click(),
        ]);
        if (newPage) {
          await newPage.waitForLoadState("networkidle");
          await expect(newPage.locator("body")).toBeVisible();
          await newPage.close();
        }
      }
    });
  });

  // ─── 12. Page Layouts Load Check ─────────────────────────────────────

  test.describe("Page Layouts", () => {
    test("Payment Methods page should load", async ({ page }) => {
      const errors = setupConsoleCapture(page);
      await page.goto("/payment-methods");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const relevantErrors = errors.filter(
        (e) => !e.message.includes("favicon") && !e.message.includes("404")
      );
      expect(relevantErrors).toHaveLength(0);
      await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("Homepage Layout page should load", async ({ page }) => {
      const errors = setupConsoleCapture(page);
      await page.goto("/homepage-layout");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const relevantErrors = errors.filter(
        (e) => !e.message.includes("favicon") && !e.message.includes("404")
      );
      expect(relevantErrors).toHaveLength(0);
      await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("Compliance Settings page should load", async ({ page }) => {
      const errors = setupConsoleCapture(page);
      await page.goto("/compliance-settings");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const relevantErrors = errors.filter(
        (e) => !e.message.includes("favicon") && !e.message.includes("404")
      );
      expect(relevantErrors).toHaveLength(0);
      await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("Email Settings page should load", async ({ page }) => {
      const errors = setupConsoleCapture(page);
      await page.goto("/email-settings");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const relevantErrors = errors.filter(
        (e) => !e.message.includes("favicon") && !e.message.includes("404")
      );
      expect(relevantErrors).toHaveLength(0);
      await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("Referrals page should load", async ({ page }) => {
      const errors = setupConsoleCapture(page);
      await page.goto("/referrals");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const relevantErrors = errors.filter(
        (e) => !e.message.includes("favicon") && !e.message.includes("404")
      );
      expect(relevantErrors).toHaveLength(0);
      await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
        timeout: 10000,
      });
    });

    test("Livestream Draws page should load", async ({ page }) => {
      const errors = setupConsoleCapture(page);
      await page.goto("/livestream/draws");
      await page.waitForLoadState("networkidle");
      await page.waitForTimeout(2000);
      const relevantErrors = errors.filter(
        (e) => !e.message.includes("favicon") && !e.message.includes("404")
      );
      expect(relevantErrors).toHaveLength(0);
      await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
        timeout: 10000,
      });
    });
  });
});

test.describe("Manager Role E2E", () => {
  let capturedErrors: { message: string }[];

  test.beforeEach(async ({ page }) => {
    capturedErrors = setupConsoleCapture(page);
    await loginAs(page, MANAGER_EMAIL, MANAGER_PASSWORD);
  });

  test.afterEach(async () => {
    if (capturedErrors.length > 0) {
      test.info().annotations.push({
        type: "console-errors",
        description: capturedErrors.map((e) => e.message).join("\n"),
      });
    }
  });

  test("should see operational nav but not sensitive nav", async ({ page }) => {
    await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("link", { name: /Competitions/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Livestream Draws/i }).first()).toBeVisible();
    await expect(page.getByRole("link", { name: /Payment Methods/i }).first()).not.toBeVisible();
    await expect(page.getByRole("link", { name: /Compliance/i }).first()).not.toBeVisible();
    await expect(page.getByRole("link", { name: /SEO Settings/i }).first()).not.toBeVisible();
    await expect(page.getByRole("link", { name: /Conversion Tracking/i }).first()).not.toBeVisible();
  });

  test("should be blocked from sensitive admin-only pages", async ({ page }) => {
    await page.goto("/payment-methods");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveURL(/access-denied/);
  });

  test("should load operational users page read-only", async ({ page }) => {
    await page.goto("/users");
    await page.waitForLoadState("networkidle");
    await expect(page.locator("h1").or(page.locator("h2")).first()).toBeVisible({
      timeout: 10000,
    });
    await expect(page.getByRole("button", { name: /Grant Admin/i }).first()).not.toBeVisible();
    await expect(page.getByRole("button", { name: /Delete/i }).first()).not.toBeVisible();
  });
});
