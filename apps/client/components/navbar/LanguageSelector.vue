<script lang="ts" setup>
const { t, locale, locales } = useI18n();

const switchLocalePath = useSwitchLocalePath();

const getLocaleFlag = (locale: string) => {
	switch (locale) {
		case 'en':
			return 'circle-flags:us-um';
		case 'pt':
			return 'circle-flags:br';
		case 'es':
			return 'circle-flags:es';
		default:
			return 'circle-flags:us-um';
	}
};

const handleSwitchLocale = (new_locale: any) => {
	navigateTo(switchLocalePath(new_locale));
};
</script>

<style lang="scss" scoped>
@use '~/assets/scss/components/navbar/language-selector.scss';
</style>

<template>
	<Dropdown placement="bottom-end" :offset="24">
		<template #trigger="{ toggleIsOpen }">
			<button
				@click="toggleIsOpen"
				class="navbar-language-selector-button"
				:aria-label="t('components.navbar.language_selector.button.label')">
				<Transition name="transition_navbar_language_selector" mode="out-in">
					<Icon :key="locale" :name="getLocaleFlag(locale)" size="30" />
				</Transition>
			</button>
		</template>

		<template #default>
			<DropdownItem
				v-for="localeData in locales"
				:key="localeData.code"
				@click="handleSwitchLocale(localeData.code)"
				class="flex items-center gap-2">
				<Icon size="24" :name="getLocaleFlag(localeData.code)" />

				{{ t(`locales.${localeData.code}`) }}
			</DropdownItem>
		</template>
	</Dropdown>
</template>
