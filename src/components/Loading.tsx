const PageLoading = () => {
	return (
		<div class="flex flex-col w-11/12 md:w-3/4 mx-auto pt-16 space-y-4 grow">
			<div class="skeleton w-2/3 h-16 grow-0" />
			<div class="skeleton w-full h-20" />
			<div class="skeleton w-full h-40" />
		</div>
	);
};

export default PageLoading;
