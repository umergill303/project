<template>
  <UDashboardPanel id="post_products" :ui="{ body: 'gap-2 sm:gap-3' }">
    <template #header>
      <UDashboardNavbar>
        <template #leading>
          <AppBreadcrumbs />
        </template>
      </UDashboardNavbar>
    </template>
    <template #body>
      <DashboardProductsForm mode="add" />
    </template>
  </UDashboardPanel>
</template>
