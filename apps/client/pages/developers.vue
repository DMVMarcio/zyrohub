<script lang="ts" setup>
import { ToolTagEnum } from '~/shared/types';

const { t } = useI18n();

const tools = useTools();

const devTools = computed(() => tools.tools.filter(tool => tool.tags.includes(ToolTagEnum.DEV)));
</script>

<template>
	<div class="container">
		<ToolkitLayout :tools="devTools" path="developers">
			<template #title>
				<Icon size="22" name="ant-design:code-filled" /> {{ t('pages.developers.title') }}
			</template>
		</ToolkitLayout>
	</div>
</template>
