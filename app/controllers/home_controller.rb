class HomeController < ApplicationController
  def index
    @current_order = current_user.current || 0;

  end
end
